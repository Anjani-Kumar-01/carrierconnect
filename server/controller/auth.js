const User = require("../models/User");
const JobProvider = require("../models/Company");
const Jobseeker = require("../models/Profile");
const OTP = require("../models/OTP");
const bcrypt = require("bcrypt");
const JWT = require("jsonwebtoken");
const otpgenerator = require("otp-generator");
require("dotenv").config();


exports.sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    // Basic validation
    if (!email || typeof email !== "string") {
      return res.status(400).json({ success: false, message: "A valid email is required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: "User already exists" });
    }

    // Generate a unique 6-digit OTP
    let otp;
    do {
      otp = otpgenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });
    } while (await OTP.findOne({ otp }));

    // Save OTP with expiration (5 min)
    await OTP.create({ email, otp, createdAt: new Date() });

    console.log("Generated OTP:", otp); // ⚠️ Remove in production

    return res.status(200).json({
      success: true,
      message: "OTP generated and sent successfully",
      otp, // ⚠️ Only for testing
    });
  } catch (error) {
    console.error("SEND OTP ERROR:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};


exports.signUp = async (req, res) => {
  try {
    const {
      Name,
      email,
      password,
      confirmPassword,
      otp,
      accountType,
      description,
      location,
      website,
    } = req.body;

    // Required field validation
    if (!Name || !email || !password || !confirmPassword || !accountType || !otp) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    // Password match check
    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: "Passwords do not match" });
    }

    // Check for existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: "User already registered" });
    }

    // Check OTP validity
    const recentOtp = await OTP.findOne({ email }).sort({ createdAt: -1 });
    if (!recentOtp) {
      return res.status(400).json({ success: false, message: "No OTP found for this email" });
    }

    // Expire OTP after 5 minutes
    const otpExpiry = new Date(recentOtp.createdAt).getTime() + 5 * 60 * 1000;
    if (Date.now() > otpExpiry) {
      return res.status(400).json({ success: false, message: "OTP has expired. Please request a new one." });
    }

    if (recentOtp.otp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    let newUser;

    // Create user based on account type
    if (accountType === "Job-Provider") {
      newUser = new JobProvider({
        Name,
        email,
        password: hashedPassword,
        accountType,
        image: `https://api.dicebear.com/5.x/initials/svg?seed=${encodeURIComponent(Name)}`,
        description: description || "",
        location: location || "",
        website: website || "",
      });
    } else if (accountType === "Jobseeker") {
      newUser = new Jobseeker({
        Name,
        email,
        password: hashedPassword,
        accountType,
        image: `https://api.dicebear.com/5.x/initials/svg?seed=${encodeURIComponent(Name)}`,
      });
    } else {
      return res.status(400).json({ success: false, message: "Invalid account type" });
    }

    // Save user
    await newUser.save();

    // Remove used OTP
    await OTP.deleteMany({ email });

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: newUser._id,
        Name: newUser.Name,
        email: newUser.email,
        accountType: newUser.accountType,
        image: newUser.image,
      },
    });
  } catch (error) {
    console.error("SIGNUP ERROR:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};


exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const user = await User.findOne({ email }).populate("additionalDetails");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: "Incorrect password" });
    }

    // Check JWT secret
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is missing in .env file");
      return res.status(500).json({ success: false, message: "Server configuration error" });
    }

    // Generate token
    const payload = { email: user.email, id: user._id, accountType: user.accountType };
    const token = JWT.sign(payload, process.env.JWT_SECRET, { expiresIn: "2h" });

    user.token = token;
    user.password = undefined;

    // Set cookie
    const cookieOptions = {
      expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    };

    res.cookie("token", token, cookieOptions).status(200).json({
      success: true,
      message: "Login successful",
      token,
      user,
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};


