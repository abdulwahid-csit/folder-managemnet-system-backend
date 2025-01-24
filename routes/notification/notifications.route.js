const express = require("express");
const router = express.Router();
const {
  getNotifications, markAsRead, markAllAsRead
} = require("../../controllers/notifications/notifications.controller");

// POST route to create a new FYP
router.get("/notifications/:id?", getNotifications);
router.put("/read/:id?", markAsRead);
router.put("/all-read/:id?", markAllAsRead);
module.exports = router;
