import {Application} from "../models/application.model.js";
import {Job} from "../models/job.model.js";
import {User} from "../models/user.model.js";

//ya ha for the helper and self worker
export const createApplication = async (req, res) => {
    try {
        const {
            name,
            age,
            gender,
            address,
            skills,
            education,
            contact,
            jobId
        } = req.body;

        // Check for missing fields
        const missingFields = [];
        if (!name) missingFields.push("name");
        if (!age) missingFields.push("age");
        if (!gender) missingFields.push("gender");
        if (!address) missingFields.push("address");
        if (!skills) missingFields.push("skills");
        if (!education) missingFields.push("education");
        if (!contact) missingFields.push("contact");
        if (!jobId) missingFields.push("jobId");

        if (missingFields.length > 0) {
            return res.status(400).json({
                message: "Missing required fields",
                missingFields,
                success: false
            });
        }

        // Check if user exists
        const user = await User.findById(req.id);
        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false
            });
        }

        // Check if job exists
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({
                message: "Job not found",
                success: false
            });
        }

        // Check if user is helper or self-worker
        if (user.role !== "helper" && user.role !== "selfworker") {
            return res.status(403).json({
                message: "Only helpers and self-workers can apply for jobs",
                success: false
            });
        }

        // For self-worker: Check if they have already applied for this job
        if (user.role === "selfworker") {
            const existingApplication = await Application.findOne({
                jobId,
                appliedBy: req.id
            });

            if (existingApplication) {
                return res.status(400).json({
                    message: "You have already applied for this job",
                    success: false
                });
            }
        }

        // Create the application
        const application = await Application.create({
            name,
            age,
            gender,
            address,
            skills,
            education,
            contact,
            jobId,
            appliedBy: req.id
        });

        // Add the application to the job's applicants array
        await Job.findByIdAndUpdate(jobId, {
            $push: { applicants: application._id }
        });

        return res.status(201).json({
            message: "Application submitted successfully",
            application,
            success: true
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Error submitting application",
            error: error.message,
            success: false
        });
    }
}

// Get all applications for a specific job (for recruiters)

//recruiter ka sara applicants  ,uska uss particular job ka
export const getJobApplications = async (req, res) => {
    try {
        const { jobId, status } = req.params;

        // Validate status parameter
        const validStatuses = ['applied', 'approved', 'hired', 'rejected'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid status. Must be one of: applied, approved, hired,rejected",
                success: false
            });
        }

        // Check if user is a recruiter
        const user = await User.findById(req.id);
        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false
            });
        }

        if (user.role !== "recruiter") {
            return res.status(403).json({
                message: "Only recruiters can view applications",
                success: false
            });
        }

        // Check if job exists and belongs to the recruiter
        const job = await Job.findOne({
            _id: jobId,
            createdby: req.id
        });

        if (!job) {
            return res.status(404).json({
                message: "Job not found or you don't have permission to view its applications",
                success: false
            });
        }

        // Get applications for this job with the specified status
        const applications = await Application.find({ 
            jobId,
            status: status 
        }).populate('appliedBy', 'fullname email phoneNumber role');

        return res.status(200).json({
            message: `Successfully retrieved ${status} applications`,
            applications,
            count: applications.length,
            success: true
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Error fetching applications",
            error: error.message,
            success: false
        });
    }
}

// Get all applications submitted by a user (helper or self-worker)

export const getUserApplications = async (req, res) => {
    try {
        const user = await User.findById(req.id);
        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false
            });
        }

        if (user.role !== "helper" && user.role !== "selfworker") {
            return res.status(403).json({
                message: "Only helpers and self-workers can view their applications",
                success: false
            });
        }

        const applications = await Application.find({ appliedBy: req.id })
            .populate('jobId', 'title description workType workingHours salary');

        return res.status(200).json({
            applications,
            success: true
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Error fetching applications",
            error: error.message,
            success: false
        });
    }
}

// Update application status (for recruiters)
export const updateApplicationStatus = async (req, res) => {
    try {
        const { applicationId } = req.params;
        const { status } = req.body;

        if (!status || !['applied', 'pending', 'hired', 'rejected'].includes(status)) {
            return res.status(400).json({
                message: "Invalid status",
                success: false
            });
        }

        // Check if user is a recruiter
        const user = await User.findById(req.id);
        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false
            });
        }

        if (user.role !== "recruiter") {
            return res.status(403).json({
                message: "Only recruiters can update application status",
                success: false
            });
        }

        // Find the application and check if it exists
        const application = await Application.findById(applicationId);
        if (!application) {
            return res.status(404).json({
                message: "Application not found",
                success: false
            });
        }

        // Check if the job belongs to this recruiter
        const job = await Job.findOne({
            _id: application.jobId,
            createdby: req.id
        });

        if (!job) {
            return res.status(403).json({
                message: "You don't have permission to update this application",
                success: false
            });
        }

        // Update the application status
        application.status = status;
        await application.save();

        return res.status(200).json({
            message: "Application status updated successfully",
            application,
            success: true
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Error updating application status",
            error: error.message,
            success: false
        });
    }
}


// Get applications and count for a specific job by a helper
export const getHelperJobApplicationCount = async (req, res) => {
    try {
        const { jobId } = req.params;

        // Check if user exists
        const user = await User.findById(req.id);
        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false
            });
        }

        // Check if user is a helper
        if (user.role !== "helper") {
            return res.status(403).json({
                message: "Only helpers can view their applications",
                success: false
            });
        }

        // Check if job exists
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({
                message: "Job not found",
                success: false
            });
        }

        // Get all applications for this job by this helper
        const applications = await Application.find({
            jobId,
            appliedBy: req.id
        }).populate('jobId', 'title description workType workingHours salary');

        // Count applications
        const applicationCount = applications.length;

        return res.status(200).json({
            message: "Applications retrieved successfully",
            jobTitle: job.title,
            applicationCount,
            applications,
            success: true
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Error fetching applications",
            error: error.message,
            success: false
        });
    }
}
