const nodemailer = require("nodemailer");

const mailSender = async (email, subject, body) => {
  try {
    let transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST, 
      port: 587,
      secure: false,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    let info = await transporter.sendMail({
      from: `"Carrier Connect" <${process.env.MAIL_USER}>`,
      to: email,
      subject: subject,
      html: body,
    });

    console.log(" Email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error(" Error in mailSender:", error);
    throw error;
  }
};

module.exports = mailSender;
