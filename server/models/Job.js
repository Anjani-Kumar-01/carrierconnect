const mongoose = require('mongoose')

const JobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true 
    },
    description:{
        type:String,
    },
    requirement:{
        type:String,
    },
    salary:{
        type:Number,
        required:true
    },
    role:{
        type:String,
    },
    location:{
        type:String,
    },
    type: {
        type: String,
        enum: ["full-time", "part-time", "internship", "remote", "training"],
        default: "full-time"
    },
    postedDate: {
        type: Date, 
        default: Date.now 
    },
    companyId: {
        type:String,
        // type: mongoose.Schema.Types.ObjectId,
        // ref: "Company",
        required: true, 
    }

})

module.exports = mongoose.model("Job",JobSchema);