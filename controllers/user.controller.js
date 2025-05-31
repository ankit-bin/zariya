import bcrypt from "bcryptjs";
import {User} from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { uploadToCloudinary } from '../utils/cloudinary.js';

import dotenv from "dotenv";

//register user 

export const register = async (req, res) => {
  try {
      const { fullname,email,phoneNumber,password,role } = req.body;
      if(!fullname || !email || !phoneNumber || !password || !role) {
          return res.status(400).json({ message: "Please fill all the fields" });
      }
      const user = await User.findOne({ email });
      if (user) {
          return res.status(400).json({ message: "User already exists",success:false });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await User.create({
          fullname,
          email,
          phoneNumber,
          password: hashedPassword,
          role
      });

      // Generate JWT token for automatic login
      const tokenData = {
          userId: newUser._id,
      };
      const token = jwt.sign(tokenData, process.env.SECRET_KEY, { expiresIn: "1d" });

      const userData = {
          _id: newUser._id,
          fullname: newUser.fullname,
          email: newUser.email,
          phoneNumber: newUser.phoneNumber,
          role: newUser.role,
          profile: newUser.profile,
      }

      return res.status(201)
          .cookie("token", token, {
              maxAge: 24 * 60 * 60 * 1000,
              httpOnly: true,
              sameSite: "Strict",
              secure: true
          })
          .json({ 
              message: "Account created and logged in successfully",
              token,
              user: userData,
              success: true 
          });
  } catch (error) {
       console.log(error);
       return res.status(500).json({ message: "Registration error",success:false }); 
  }
}


//login user 

export const login = async (req, res) => {
   try {
       const { email, password,role } = req.body;
       if (!email || !password || !role) {
           return res.status(400).json({ message: "Please fill all the fields" });
       }
       let user = await User.findOne({ email });
       if (!user) {
           return res.status(400).json({ message: "User not found",success:false });
       }
       const isPasswordMatch = await bcrypt.compare(password, user.password);
       if (!isPasswordMatch) {
           return res.status(400).json({ message: "Invalid credentials(password)",success:false });
       }
       if (user.role !== role) {
           return res.status(400).json({ message: "acccount doesnt exist with current role",success:false });
       }
       // Generate JWT token and set it in a cookie
      const tokenData = {
           userId: user._id,
          
       };
       const token = jwt.sign(tokenData, process.env.SECRET_KEY, { expiresIn: "1d" });

       user = {
           _id: user._id,
           fullname: user.fullname,
           email: user.email,
           phoneNumber: user.phoneNumber,
           role: user.role,
           profile:user.profile,
       }
//YAHA CHANGE KIYA GAYA HAI , TOKEN KO , RESPONSE MAI BHI SEND KIYA GAYA HAI ..! 
       return res.status(200).cookie("token", token, {maxAge: 24 * 60 * 60 * 1000, httpOnly: true, sameSite: "Strict", secure: true}).json({ message: `welcome back ${user.fullname} `,token,user,success:true });
   } catch (error) {
           
           return res.status(500).json({ message: "login time error aya hai catch block wala ",success:false });
   }

}

//user logout

export const logout = async (req, res) => {
   try {
       return res.status(200).cookie("token", "", {maxAge:0}).json({ message: "Logged out successfully",success:true });

   } catch (error) {
       return res.status(500).json({ message: "Logout error",success:false });
   }
}



//update profile



export const UpdateProfile = async (req, res) => {
   try {
       const { fullname, email, phoneNumber } = req.body;
       const profilePicture = req.body.profilePicture; // This will be base64 string from Kotlin

       const userId = req.id; // from auth middleware

       let user = await User.findById(userId);
       if (!user) {
           return res.status(400).json({ message: "User not found", success: false });
       }

       // Upload profile picture if provided
       if (profilePicture) {
           try {
               const profilePictureUrl = await uploadToCloudinary(profilePicture);
               user.profilePicture = profilePictureUrl;
           } catch (error) {
               return res.status(400).json({
                   message: "Failed to upload profile picture",
                   success: false
               });
           }
       }

       // Update other user details
       if (fullname) user.fullname = fullname;
       if (email) user.email = email;
       if (phoneNumber) user.phoneNumber = phoneNumber;

       await user.save();
       
       user = {
           _id: user._id,
           fullname: user.fullname,
           email: user.email,
           phoneNumber: user.phoneNumber,
           role: user.role,
           profilePicture: user.profilePicture
       }

       return res.status(200).json({ 
           message: "Profile updated successfully", 
           user,
           success: true 
       });
   } catch (error) {
       console.error('Profile update error:', error);
       return res.status(500).json({ 
           message: "Profile update error",
           success: false 
       });
   }
}