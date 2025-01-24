const express = require("express");
const router = express.Router();
const authController = require("../../controllers/auth/authentication"); // Import controller functions
const upload = require("../../utills/upload");

// POST /signup - Calls the signup function in the controller
router.post("/signup", authController.signup);
router.post("/signin", authController.signin);
router.post("/forgot-password", authController.forgotPassword);
router.post("/verify-otp", authController.verifyOtp);
router.post("/password-recovery", authController.passwordRecovery);
router.get("/details", authController.getUserDetails);
router.post("/user",upload.single("file"), authController.updateUserDetails);


module.exports = router;

module.exports = router;
 