import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    phoneNumber: {
        type: Number,
        required: true,

    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ["recruiter", "helper","selfworker"],
        required: true,
    },
   //currently use nhi kr rha isko..!
    profilePicture:{
        type: String,
        default:""
    }
     
},{timestamps:true});

export const User = mongoose.model("User", userSchema);
