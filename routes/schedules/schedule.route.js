const express = require("express");
const router = express.Router();
const {
  createSchedule,
  getActiveSchedules,
  getCompletedSchedules,
  getAllSchedules,
  deleteSchedule,
} = require("../../controllers/schedules/schedule.controller");

// POST /signup - Calls the signup function in the controller
router.post("/add-schedule", createSchedule);
// router.put("/todo/:id", todoController.updateTodoCompletion);
// router.delete("/todo/:id?", todoController.deleteTodo);
router.get("/schedules", getAllSchedules);
router.get("/completed", getCompletedSchedules);
router.get("/active", getActiveSchedules);
router.delete("/delete-schedule/:scheduleId", deleteSchedule);
// router.post("/complete-todo", todoController.updateTodoCompletion);

module.exports = router; 
