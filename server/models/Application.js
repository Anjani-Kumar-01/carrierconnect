const mongoose = require('mongoose')

const ApplicationSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Job",
        required: true 
    },
    status: {
        type: String,
        enum: ["applied", "shortlisted", "rejected", "hired"],
        default: "applied"
    },
    appliedDate: { 
        type: Date,
        default: Date.now 
    }
});

module.exports= mongoose.model("Application", ApplicationSchema)