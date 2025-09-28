const mongoose = require('mongoose')

const CompanySchema = new mongoose.Schema({
    name: {
        type: String, 
        required: true 
    },
    logo:{
        type:String
    },
    description:{
        type:String
    },
    website:{
        type:String
    },
    location:{
        String
    }
})

module.exports = mongoose.module("Comapany", CompanySchema)