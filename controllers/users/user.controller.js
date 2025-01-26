const User = require("../../models/User/user.modal");
const bcrypt = require("bcryptjs");

const getAllUsers = async (req, res) => {
  try {
    const search = req.query.search || "";
    const limit = parseInt(req.query.limit) || 1000;

    let filter = {  };
      if (search) {
        const searchRegex = new RegExp(search, "i");
        filter.$or = [
          { firstName: { $regex: searchRegex } },
          { email: { $regex: searchRegex } },
          { username: { $regex: searchRegex } },
          { lastName: { $regex: searchRegex } },
        ];
      }

    const users = await User.find(filter).limit(limit)
      .sort({ createdAt: -1 })
      .exec();;

    return res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      data: users, 
    });
  } catch (error) {
    console.error("Error fetching users:", error);

    return res.status(500).json({
      success: false,
      message: "Error fetching users",
      error: error.message,
    });
  }
};


const addNewUser = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      username,
      email,
      phone,
      password,
      isAdmin,
    } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    const newUser = new User({
      firstName,
      lastName,
      username,
      email,
      phone,
      password,
      isAdmin,
    });

    await newUser.save();

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      data: newUser,
    });
  } catch (error) {
    console.error("Error creating user:", error);

    return res.status(500).json({
      success: false,
      message: "Error creating user",
      error: error.message,
    });
  }
};


const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params; 

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error);

    return res.status(500).json({
      success: false,
      message: "Error deleting user",
      error: error.message,
    });
  }
};


const updatePassword = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Permission denied. Admins only.",
      });
    }

    const { userId, password } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.password = password;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Error updating password:", error);

    return res.status(500).json({
      success: false,
      message: "Error updating password",
      error: error.message,
    });
  }
};


module.exports = { getAllUsers, addNewUser, deleteUser, updatePassword };
