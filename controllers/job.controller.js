import { Job } from "../models/job.model.js";
import { User } from "../models/user.model.js";
import { Company } from "../models/company.model.js";

export const postJob = async (req, res) => {
    try {
        const {
            title,
            description,
            workType,
            workingHours,
            salary,
            skillsRequired,
            contact
        } = req.body;

        // Check for missing fields
        const missingFields = [];
        if (!title) missingFields.push("title");
        if (!description) missingFields.push("description");
        if (!workType) missingFields.push("workType");
        if (!workingHours) missingFields.push("workingHours");
        if (!salary) missingFields.push("salary");
        if (!skillsRequired) missingFields.push("skillsRequired");
        if (!contact) missingFields.push("contact");

        if (missingFields.length > 0) {
            return res.status(400).json({
                message: "Missing required fields",
                missingFields,
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
                message: "Only recruiters can post jobs",
                success: false
            });
        }

        // Find the company associated with the user
        const company = await Company.findOne({ userid: req.id });
        if (!company) {
            return res.status(404).json({
                message: "Company not found for this recruiter",
                success: false
            });
        }

        // Create new job
        const job = await Job.create({
            title,
            description,
            workType,
            workingHours,
            salary,
            skillsRequired,
            contact,
            companyId: company._id,
            createdby: req.id

        });

        return res.status(201).json({
            message: "Job posted successfully",
            job,
            success: true
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Error posting job",
            error: err.message,
            success: false
        });
    }
}

// job?keyword="cleaning"

export const getAllJobs = async (req, res) => {
    try {
        const keyword = req.query.keyword || "";
        const query = {
            $or: [
                { title: { $regex: keyword, $options: "i" } },
                { description: { $regex: keyword, $options: "i" } }
            ]
        };

        const jobs = await Job.find(query).populate('companyId', 'name description location website');

        //.populate({path:compan})

        if (!jobs || jobs.length === 0) {
            return res.status(404).json({
                message: "Jobs not found",
                success: false
            });
        }

        return res.status(200).json({
            jobs,
            success: true
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Error fetching jobs",
            error: error.message,
            success: false
        });
    }
}

//get all job created by that recruiter
export const getRecruiterJobs = async (req, res) => {
    try {
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
                message: "Only recruiters can access their jobs",
                success: false
            });
        }

        // Find all jobs created by this recruiter
        const jobs = await Job.find({ createdby: req.id })
            .populate('companyId', 'name description location website')
            .populate('applicants', 'name age gender skills education contact');

        if (!jobs || jobs.length === 0) {
            return res.status(404).json({
                message: "No jobs found for this recruiter",
                success: false
            });
        }

        return res.status(200).json({
            jobs,
            success: true
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Error fetching recruiter jobs",
            error: error.message,
            success: false
        });
    }
}

//update job
export const updateJob = async (req, res) => {
    try {
        const { jobId } = req.params;
        const {
            title,
            description,
            workType,
            workingHours,
            salary,
            skillsRequired,
            contact
        } = req.body;

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
                message: "Only recruiters can update jobs",
                success: false
            });
        }

        // Find the job and check if it exists
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({
                message: "Job not found",
                success: false
            });
        }

        // Check if the job belongs to this recruiter
        if (job.createdby.toString() !== req.id) {
            return res.status(403).json({
                message: "You can only update your own jobs",
                success: false
            });
        }

        // Update the job
        const updatedJob = await Job.findByIdAndUpdate(
            jobId,
            {
                title: title || job.title,
                description: description || job.description,
                workType: workType || job.workType,
                workingHours: workingHours || job.workingHours,
                salary: salary || job.salary,
                skillsRequired: skillsRequired || job.skillsRequired,
                contact: contact || job.contact
            },
            { new: true }
        ).populate('companyId', 'name description location website');

        return res.status(200).json({
            message: "Job updated successfully",
            job: updatedJob,
            success: true
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Error updating job",
            error: error.message,
            success: false
        });
    }
}

//delete job

export const deleteJob = async (req, res) => {
    try {
        const { jobId } = req.params;

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
                message: "Only recruiters can delete jobs",
                success: false
            });
        }

        // Find the job and check if it exists
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({
                message: "Job not found",
                success: false
            });
        }

        // Check if the job belongs to this recruiter
        if (job.createdby.toString() !== req.id) {
            return res.status(403).json({
                message: "You can only delete your own jobs",
                success: false
            });
        }

        // Delete the job
        await Job.findByIdAndDelete(jobId);

        return res.status(200).json({
            message: "Job deleted successfully",
            success: true
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Error deleting job",
            error: error.message,
            success: false
        });
    }
}