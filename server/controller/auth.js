const User = require("../models/User");
const bcrypt = require('bcrypt');
const JWT = require("jsonwebtoken");
require ("dotenv").config();
// sent otp

// signup
exports.signUp = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      accountType,
      otp, // ✅ lowercase here
    } = req.body;

    if (!firstName || !lastName || !email || !password || !confirmPassword || !otp) {
      return res.status(403).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already registered",
      });
    }

    // Validate OTP
    const recentOtpEntry = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);
    if (recentOtpEntry.length === 0) {
      return res.status(400).json({
        success: false,
        message: "OTP not found",
      });
    }

    if (recentOtpEntry[0].otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      accountType,
      image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
    });

    return res.status(200).json({
      success: true,
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    console.error("SIGNUP ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};


//login
exports.login = async (req,res)=>{
   try{
 // get data from req body
 const {email,password} = req.body;
 //validate data
 if(!email || !password){
    return res.status(403).json({
        success:false,
        message:'All fields are required ,please try again',
    });
 }
 //user check exist or not
 const user = await User.findOne({ email }).populate("additionalDetails")
 if(!user){
     return res.status(401).json({
        success:false,
        message:"user doesnot exist",
        
     })
   
 }
 //generateJWT after password match
   if(await bcrypt.compare(password,user.password)){
    const payload = {
        email:user.email,
        id:user._id,
        accountType:user.accountType,
    }
        
    
    const  token = JWT.sign(payload,process.env.JWT_SECRET,{
        expiresIn:"2h",
    });
    user.token = token;
    user.password = undefined;
  
 //create cookie and send response
 const Option ={
    expires: new Date(Date.now()+ 3*24*60*60*100),
    httpOnly:true,
 }
 res.cookie("token",token,Option).status(200).json({
    success:true,
    token,
    user,
    message:'login successfully'
 });
}else{
   return res.status(401).json({
    success:false,
    message:"password is incorrect"
   });
 }
   }catch(error){
    console.log(error);
    return res.status(500).json({
        success:false,
        message:"something went wrong "
    })

   }
};
//change password


