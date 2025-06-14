import {Company} from "../models/company.model.js";
import {User} from "../models/user.model.js";
import { searchLocation, validateLocation } from "../utils/map.js";
import { uploadToCloudinary } from '../utils/cloudinary.js';

// Add new endpoint for location suggestions
export const getLocationSuggestions = async (req, res) => {
    try {
        const { query } = req.query;
        
        if (!query) {
            return res.status(400).json({ 
                message: "Search query is required",
                success: false 
            });
        }

        const suggestions = await searchLocation(query);
        
        return res.status(200).json({
            suggestions,
            success: true
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ 
            message: "Error fetching location suggestions",
            success: false 
        });
    }
};

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

        // Validate location if provided
        let validatedLocation = null;
        if (location) {
            validatedLocation = await validateLocation(location);
            if (!validatedLocation) {
                return res.status(400).json({ 
                    message: "Invalid location provided",
                    success: false 
                });
            }
        }

        company = await Company.create({
            name: companyName,
            description,
            location: validatedLocation ? {
                type: String,
                lat: validatedLocation.lat,
                lon: validatedLocation.lon
            } : location,
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
        const logoFile = req.body.logo; // This will be base64 string from Kotlin

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

        // Validate location if provided
        let validatedLocation = null;
        if (location && location !== company.location) {
            validatedLocation = await validateLocation(location);
            if (!validatedLocation) {
                return res.status(400).json({ 
                    message: "Invalid location provided",
                    success: false 
                });
            }
        }

        // Upload logo if provided
        let logoUrl = company.logo;
        if (logoFile) {
            try {
                logoUrl = await uploadToCloudinary(logoFile);
            } catch (error) {
                return res.status(400).json({
                    message: "Failed to upload logo",
                    success: false
                });
            }
        }

        // Update the company
        const updatedCompany = await Company.findByIdAndUpdate(
            company._id,
            {
                name: companyName || company.name,
                description: description || company.description,
                location: validatedLocation ? {
                    type: String,
                    lat: validatedLocation.lat,
                    lon: validatedLocation.lon
                } : (location || company.location),
                website: website || company.website,
                logo: logoUrl
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


