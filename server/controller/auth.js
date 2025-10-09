const User = require("../models/User");
const OTP = require("../models/OTP");
const bcrypt = require("bcrypt");
const JWT = require("jsonwebtoken");
const otpgenerator = require("otp-generator");
require("dotenv").config();

const JobProvider = require("../models/JobProvider");
const Jobseeker = require("../models/Jobseeker");

// Send OTP
exports.sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    // Generate OTP
    let otp = otpgenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    console.log("Generated OTP:", otp);

    // Ensure uniqueness
    while (await OTP.findOne({ otp })) {
      otp = otpgenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });
    }

    // Save OTP
    await OTP.create({ email, otp });

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      otp, // ❗ Remove this in production (only for testing)
    });
  } catch (error) {
    console.error("SEND OTP ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Signup
exports.signUp = async (req, res) => {
  try {
    const { Name, email, password, confirmPassword, otp, accountType, description, location, website } = req.body;

    if (!Name || !email || !password || !confirmPassword || !accountType || !otp) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: "Passwords do not match" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already registered" });
    }

    // Verify OTP
    const recentOtp = await OTP.findOne({ email }).sort({ createdAt: -1 });
    if (!recentOtp || recentOtp.otp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    let newUser;

    // Create user based on role
    if (accountType === "Job-Provider") {
      newUser = new JobProvider({
        Name,
        email,
        password: hashedPassword,
        accountType,
        image: `https://api.dicebear.com/5.x/initials/svg?seed=${Name}`,
        description,
        location,
        website,
      });
    } else if (accountType === "Jobseeker") {
      newUser = new Jobseeker({
        Name,
        email,
        password: hashedPassword,
        accountType,
        image: `https://api.dicebear.com/5.x/initials/svg?seed=${Name}`,
      });
    } else {
      return res.status(400).json({ success: false, message: "Invalid account type" });
    }

    await newUser.save();

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: newUser,
    });
  } catch (error) {
    console.error("SIGNUP ERROR:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const user = await User.findOne({ email }).populate("additionalDetails");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: "Incorrect password" });
    }

    if (!process.env.JWT_SECRET) {
      console.error("Missing JWT_SECRET in environment");
      return res.status(500).json({ success: false, message: "Server configuration error" });
    }

    // Generate JWT
    const payload = { email: user.email, id: user._id, accountType: user.accountType };
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
      message: "Internal server error",
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
      return res.status(400).json({ success: false, message: "Passwords do not match" });
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
    return res.status(500).json({ success: false, message: "Internal server error" });
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
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

