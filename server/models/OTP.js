const mongoose = require("mongoose");
const mailSender = require("../utils/mailsender"); 

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300,
  },
});

async function sendVerificationEmail(email, otp) {
  try {
    const mailResponse = await mailSender(
      email,
      "Carrier Connect - Email Verification",
      `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
          <h2 style="color: #333;">Welcome to <span style="color: #007BFF;">Carrier Connect 🚀</span></h2>
          <p style="font-size: 16px; color: #555;">Your OTP is:</p>
          <h1 style="color: #007BFF; letter-spacing: 4px;">${otp}</h1>
          <p style="font-size: 14px; color: #777;">⚠️ This OTP is valid for <strong>5 minutes</strong>.</p>
        </div>
      `
    );

    console.log(`📨 Verification email sent to ${email} | Message ID: ${mailResponse.messageId}`);
  } catch (error) {
    console.error(`Error sending verification email to ${email}:`, error.message);
    throw error;
  }
}

otpSchema.pre("save", async function (next) {
  if (this.isNew) {
    await sendVerificationEmail(this.email, this.otp);
  }
  next();
});

module.exports = mongoose.model("OTP", otpSchema);
