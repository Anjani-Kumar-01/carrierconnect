const mongoose = require('mongoose')

const ProfileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    gander:{
        type:String,
    },
    dateofBirth:{
        type:Date
    },
    about:{
        type:String,
        trim:true,
    },
    contactNumber:{
        type:String,
        trim:true,
    }

})

module.exports = mongoose.module("Profile" , ProfileSchema)