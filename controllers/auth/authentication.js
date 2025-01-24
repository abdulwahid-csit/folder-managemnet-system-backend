const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../../models/User/user.modal");
const crypto = require("crypto"); 
const nodemailer = require("nodemailer");

const JWT_SECRET = "fms";
const JWT_EXPIRATION_TIME = "1y";
const REFRESH_TOKEN_EXPIRATION_TIME = "7d";

// Signup function
const signup = async (req, res) => {
  try {
    const { firstName, lastName, username, email, phone, password} = req.body;

    if (!firstName || !lastName || !email || !phone || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already registered" });
    }

    const newUser = new User({
      firstName,
      lastName,
      username,
      email,
      phone,
      password,
      
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
        username: newUser.username,
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

     const isMatch = await user.matchPassword(loginPassword);;
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
        profile_picture: user.profile_picture,

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


const getUserDetails = async (req, res) => {
  try {
    const { id } = req.query; 

    if (!id) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        phone: user.phone,
        department: user.department,
        desegnation: user.desegnation,
        profile_picture: user.profile_picture,
      },
      status_code: 200,
    });
  } catch (error) {
    console.error("Error fetching user details:", error);
    return res.status(500).json({ message: "Server error, please try again" });
  }
};

const updateUserDetails = async (req, res) => {
  try {
    const {
      firstName,
      id,
      lastName,
      username,
      email,
      phone,
      department,
      desegnation,
    } = req.body;

    const file = req?.file?.filename; 
    console.log("File: ", req.file);

    if (!firstName || !lastName || !email || !phone) {
      return res
        .status(400)
        .json({
          message: "First name, last name, email, and phone are required",
        });
    }

    const existingUser = await User.findById(id);
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    existingUser.firstName = firstName || existingUser.firstName;
    existingUser.lastName = lastName || existingUser.lastName;
    existingUser.username = username || existingUser.username;
    existingUser.email = email || existingUser.email;
    existingUser.phone = phone || existingUser.phone;
    existingUser.department = department || existingUser.department;
    existingUser.desegnation = desegnation || existingUser.desegnation;
    existingUser.profile_picture = file || existingUser.profile_picture;

    await existingUser.save();

    return res.status(200).json({
      message: "User details updated successfully",
      user: {
        id: existingUser._id,
        first_name: existingUser.firstName,
        last_name: existingUser.lastName,
        username: existingUser.username,
        email: existingUser.email,
        phone: existingUser.phone,
        department: existingUser.department,
        desegnation: existingUser.desegnation,
        profile_picture: existingUser.profile_picture,
      },
      status_code: 200,
    });
  } catch (error) {
    console.error("Error during updating user details:", error);
    return res.status(500).json({ message: "Server error, please try again" });
  }
};



module.exports = {
  signup,
  signin,
  forgotPassword,
  verifyOtp,
  passwordRecovery,
  getUserDetails,
  updateUserDetails,
};
