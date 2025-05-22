import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    age: {
        type: Number,
        required: true,
        min: 18
    },
    gender: {
        type: String,
        required: true,
        enum: ['male', 'female', 'other']
    },
    address: {
        type: String,
        required: true,
        trim: true
    },
    skills: {
        type: String,
        required: true,
        trim: true
    },
    education: {
        type: String,
        required: true,
        trim: true
    },
    contact: {
        type: String,
        required: true,
        trim: true
    },
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true
    },
    status: {
        type: String,
        enum: ['applied', 'approved', 'hired', 'rejected'],
        default: 'applied'
    },
    appliedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

export const Application = mongoose.model('Application', applicationSchema);


