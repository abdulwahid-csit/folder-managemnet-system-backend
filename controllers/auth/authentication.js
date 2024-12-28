// authController.js
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../../models/User/user.modal"); // User model
const crypto = require("crypto"); // For generating random OTP
const nodemailer = require("nodemailer");

const JWT_SECRET = "fms";
const JWT_EXPIRATION_TIME = "1h";
const REFRESH_TOKEN_EXPIRATION_TIME = "7d";

// Signup function
const signup = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password } = req.body;

    if (!firstName || !lastName || !email || !phone || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      firstName,
      lastName,
      email,
      phone,
      password: hashedPassword,
    });

    await newUser.save();

    const access_token = jwt.sign(
      { userId: newUser._id, email: newUser.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRATION_TIME }
    );
    const refresh_token = jwt.sign(
      { userId: newUser._id, email: newUser.email },
      JWT_SECRET,
      { expiresIn: REFRESH_TOKEN_EXPIRATION_TIME }
    );

    return res.status(201).json({
      access_token,
      refresh_token,
      access_token_expires: JWT_EXPIRATION_TIME,
      user: {
        id: newUser._id,
        first_name: newUser.firstName,
        last_name: newUser.lastName,
        email: newUser.email,
        phone: newUser.phone,
      },
      status_code: 201,
    });
  } catch (error) {
    console.error("Error during signup:", error);
    return res.status(500).json({ message: "Server error, please try again" });
  }
};

// Signin function
const signin = async (req, res) => {
  try {
    const { email, password: loginPassword } = req.body;

    if (!email || !loginPassword) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Email not found" });
    }

    const isMatch = await bcrypt.compare(loginPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const access_token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRATION_TIME }
    );
    const refresh_token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: REFRESH_TOKEN_EXPIRATION_TIME }
    );

    return res.status(201).json({
      access_token,
      refresh_token,
      access_token_expires: JWT_EXPIRATION_TIME,
      user: {
        id: user._id,
        first_name: user.firstName,
        last_name: user.lastName,
        email: user.email,
        phone: user.phone,
      },
      status_code: 201,
    });
  } catch (error) {
    console.error("Error during login:", error);
    return res.status(500).json({ message: "Server error, please try again" });
  }
};

// Forgot password function
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Email not found" });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpire = Date.now() + 5 * 60 * 1000;

    user.otp = otp;
    user.otpExpire = otpExpire;
    await user.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      secure: true,
      port: 465,
      auth: {
        user: "www.abdulwahid75552@gmail.com", 
        pass: "qxed lnsz bmph skgo",
      },
    });

    const mailOptions = {
      from: "Folder Management System",
      to: email,
      subject: "Folder Management System OTP",
      text: `Your OTP is ${otp}. It will expire in 5 minutes.`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("Error sending email:", error);
        return res.status(500).json({ message: "Failed to send email" });
      } else {
        console.log("Email sent: " + info.response);
        return res.status(200).json({ message: "OTP sent to your email" });
      }
    });
  } catch (error) {
    console.error("Error during forgot password:", error);
    return res.status(500).json({ message: "Server error, please try again" });
  }
};

// Verify OTP function
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Email not found" });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (user.otpExpire < Date.now()) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    return res.status(201).json({
      otpMatch: true,
    });
  } catch (error) {
    console.error("Error during OTP verification:", error);
    return res.status(500).json({ message: "Server error, please try again" });
  }
};

// Password recovery function
const passwordRecovery = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and new password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Email not found" });
    }

    if (!user.otp || user.otpExpire < Date.now()) {
      return res.status(400).json({ message: "OTP has expired or is invalid" });
    }

    user.password = password;
    user.otp = undefined;
    user.otpExpire = undefined;

    await user.save();

    return res.status(200).json({
      password_changed: true,
    });
  } catch (error) {
    console.error("Error during password reset:", error);
    return res.status(500).json({ message: "Server error, please try again" });
  }
};

module.exports = {
  signup,
  signin,
  forgotPassword,
  verifyOtp,
  passwordRecovery,
};
