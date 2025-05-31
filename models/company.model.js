import mongoose from 'mongoose';

const companySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    description: {
        type: String,
        //required: true,
    },
    location: {
        type: String,
        lat: String,
        lon: String

    },
   
    website: {
        type: String,
       // required: true,
    },
    logo: {
        type: String, // url to company logo
        default:""
    },
    userid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
}, { timestamps: true });


export const Company = mongoose.model('Company', companySchema);

