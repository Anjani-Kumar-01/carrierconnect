const mongoose = require('mongoose')

const CompanySchema = new mongoose.Schema({
    name: {
        type: String, 
       
    },
   email:{
     type:String,
   },
   password:{
     type:String,
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
});

module.exports = mongoose.model("Comapany", CompanySchema)