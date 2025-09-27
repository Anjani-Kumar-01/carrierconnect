const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    firstName:{
        type:String,
        required:true,
        trim:true,
    },
    lastName : {
        type:String ,
        required : true,
        trim : true 
    },
    email : {
        type:String ,
        required : true,
        trim:true 
    },
    password : {
        type:String ,
        required : true, 
    },
    resetPasswordExpires : {
        type : Date 
    },
    accountType : {
        type : String ,
        required : true ,
        enum : ["Admin", "Job-Provider", "Jobseeker"]
    },
    additionalDetails : {
        type : mongoose.Schema.Types.ObjectId ,
        required:true ,
        ref : "Profile"
    },
})

module.exports = mongoose.module("User", userSchema)