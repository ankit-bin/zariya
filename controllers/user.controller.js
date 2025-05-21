import bcrypt from "bcryptjs";
import {User} from "../models/user.model.js";
import jwt from "jsonwebtoken";

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
      await User.create({
          fullname,
          email,
          phoneNumber,
          password: hashedPassword,
          role
      });
        return res.status(201).json({ message: "account created successfully",success:true });
  } catch (error) {
   
       console.log(error);
       return res.status(500).json({ message: "Registration error",success:false }); 
   
  }}


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

       return res.status(200).cookie("token", token, {maxAge: 24 * 60 * 60 * 1000, httpOnly: true, sameSite: "Strict", secure: true}).json({ message: `welcome back ${user.fullname} `,user,success:true });
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
       const { fullname, email, phoneNumber,} = req.body;

       const userId = req.id; /// middleware se aaya(auth middleware se aaya)

       let user = await User.findById(userId);
       if (!user) {
           return res.status(400).json({ message: "User not found",success:false });
       }

       //update user profile

       if(fullname) user.fullname = fullname;
       if(email) user.email = email;
       if(phoneNumber) user.phoneNumber = phoneNumber;
       

       

       await user.save();
       user = {
           _id: user._id,
           fullname: user.fullname,
           email: user.email,
           phoneNumber: user.phoneNumber,
           role: user.role,
          
       }
       return res.status(200).json({ message: "Profile updated successfully", user,success:true });


      
   } catch (error) {
       return res.status(500).json({ message: "Profile update error",success:false });
   }
}