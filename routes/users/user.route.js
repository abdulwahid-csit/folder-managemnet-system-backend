const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  addNewUser,
  deleteUser,
  updatePassword,
} = require("../../controllers/users/user.controller");

// POST /signup - Calls the signup function in the controller
router.get("/users", getAllUsers);
router.post("/users", addNewUser);
router.post("/update-password", updatePassword);
router.delete("/user/:userId", deleteUser);


module.exports = router; 
