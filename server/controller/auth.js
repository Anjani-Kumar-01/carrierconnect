const User = require("../models/User");
const bcrypt = require("bcrypt");
const JWT = require("jsonwebtoken");
const OTP = require("../models/OTP");
const otpgenerator = require("otp-generator");
require("dotenv").config();

exports.sendotp = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if user already exists
    const checkUserPresent = await User.findOne({ email });
    if (checkUserPresent) {
      return res.status(401).json({
        success: false,
        message: "User already exist",
      });
    }

    // Generate OTP
    let otp = otpgenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });
    console.log("OTP generated:", otp);

    // Ensure uniqueness
    let existingOtp = await OTP.findOne({ otp });
    while (existingOtp) {
      otp = otpgenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });
      existingOtp = await OTP.findOne({ otp });
    }

    // Save OTP
    const otpPayload = { email, otp };
    await OTP.create(otpPayload);

    // Return response
    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      otp, 
    });
  } catch (error) {
    console.error("SEND OTP ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

// Signup
exports.signUp = async (req, res) => {
  try {
    const {Name, email, password, confirmPassword ,otp,accountType} = req.body;

    if (!Name || !email || !password || !confirmPassword || !accountType || !otp) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: "Passwords do not match" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      Name,
      email,
      password: hashedPassword,
      accountType,
      image: `https://api.dicebear.com/5.x/initials/svg?seed=${Name}`,
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    console.error("SIGNUP ERROR:", error);
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email }).populate("additionalDetails");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User does not exist",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Incorrect password",
      });
    }

    // Check if JWT_SECRET is set
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not defined in environment variables");
      return res.status(500).json({
        success: false,
        message: "Server configuration error",
      });
    }

    // Create JWT payload
    const payload = {
      email: user.email,
      id: user._id,
      accountType: user.accountType,
    };

    // Sign token
    const token = JWT.sign(payload, process.env.JWT_SECRET, { expiresIn: "2h" });
    user.token = token;
    user.password = undefined;

    const cookieOptions = {
      expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
      httpOnly: true,
    };

    res.cookie("token", token, cookieOptions).status(200).json({
      success: true,
      token,
      user,
      message: "Login successful",
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};


// Change Password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, password, confirmPassword } = req.body;
    const userId = req.user._id;

    if (!currentPassword || !password || !confirmPassword) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: "New passwords do not match" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ success: false, message: "Current password is incorrect" });

    user.password = await bcrypt.hash(password, 10);
    await user.save();

    return res.status(200).json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    console.error("CHANGE PASSWORD ERROR:", error);
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

// Get Profile
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).populate("additionalDetails");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    return res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("GET PROFILE ERROR:", error);
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};
