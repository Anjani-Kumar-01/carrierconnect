const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    Name:{
        type:String,
        required:true,
        trim:true,
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
        required:false ,
        ref : "Profile"
    },
})

module.exports = mongoose.model("User", userSchema)