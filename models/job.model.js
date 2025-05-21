import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    workType: {
        type: String,
        required: true,
        enum: ['Full-time', 'Part-time']
    },
    workingHours: {
        type: String,
        required: true
    },
    salary: {
        type: String,
        required: true
    },
    skillsRequired: {
        type: String,
        required: true
    },
    contact: {
        type: String,
        required: true
    },
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },
    applicants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Application'
    }],
    createdby: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

export const Job = mongoose.model('Job', jobSchema);

