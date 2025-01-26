const express = require("express");
const router = express.Router();
const upload = require("../../utills/upload");
const {
  createFyp,
  getFypsByUser,
  getFypById,
  addAttendance,
  deleteFyp,
  downloadFile,
  deleteFypAttendence,
  shareFyp,
  getFypsSharedWithUser,
  updateFyp,
  updateMembers
} = require("../../controllers/fyp/fyp.controller");

// POST route to create a new FYP
router.get("/fyp/:id?", getFypById);
router.delete("/fyp/delete/:id?", deleteFyp); 
router.delete("/fyp/deleteAttendence/:id?", deleteFypAttendence); 
router.get("/", getFypsByUser);
router.post("/create-fyp", createFyp);
router.post("/add-attendance", upload.single("file"), addAttendance);
router.get("/downloadFile/:fileName", downloadFile);
router.post("/share-fyp", shareFyp);
router.get("/shared-fyps", getFypsSharedWithUser);
router.put("/update-fyp/:fypId?", updateFyp);
router.put("/update-members/:fypId", updateMembers);
module.exports = router;
