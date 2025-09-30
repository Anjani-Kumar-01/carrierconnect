const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");
const OTPschema = mongoose.Schema({
    email:{
        type:String,
        require:true,
    },
    otp:{
        type:String,
        require:true,

    },
    createdAt:{
        type:Date,
        default:Date.now(),
        expires: 5*60,
    }
});


//email sender
async function sendVerificationEmail(email,otp) {
    try{
     const mailResponse = await mailSender(email,"verification email from study nation",otp);
     console.log("email sent sucessfully", mailResponse);
    }
    catch(error){
        console.log("error occured while sending mail",error);
        throw error;
       
    }
}

OTPschema.pre("save",async function (next) {
    await sendVerificationEmail(this.email, this.otp);
    next();
    
})

module.exports = mongoose.model("OTP",OTPschema);