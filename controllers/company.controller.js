import {Company} from "../models/company.model.js";
import {User} from "../models/user.model.js";


export const registerCompany = async (req, res) => {
    try {
        const { companyName, description, location, website } = req.body;
        
        // Check if user exists and is a recruiter
        const user = await User.findById(req.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        if (user.role !== "recruiter") {
            return res.status(403).json({ 
                message: "Only recruiters can create companies",
                success: false 
            });
        }

        if (!companyName) {
            return res.status(400).json({ message: "Company name is required" });
        }

        let company = await Company.findOne({ name: companyName });
        if (company) {
            return res.status(400).json({ message: "Company already exists" });
        }

        company = await Company.create({
            name: companyName,
            description,
            location,
            website,
            userid: req.id
        });

        return res.status(201).json({
            message: "Company created successfully",
            company,
            success: true
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Company register error: Internal server error" });
    }
}

//update company ka 


export const updateCompany = async (req, res) => {
    try {
        const { companyName, description, location, website } = req.body;

        // Find the company using user ID
        const company = await Company.findOne({ userid: req.id });
        if (!company) {
            return res.status(404).json({ message: "Company not found for this user" });
        }

        // If company name is being changed, check if new name already exists
        if (companyName && companyName !== company.name) {
            const existingCompany = await Company.findOne({ name: companyName });
            if (existingCompany) {
                return res.status(400).json({ message: "Company name already exists" });
            }
        }

        // Update the company
        const updatedCompany = await Company.findByIdAndUpdate(
            company._id,
            {
                name: companyName || company.name,
                description: description || company.description,
                location: location || company.location,
                website: website || company.website
            },
            { new: true }
        );

        return res.status(200).json({
            message: "Company updated successfully",
            company: updatedCompany,
            success: true
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Company update error: Internal server error" });
    }
}


