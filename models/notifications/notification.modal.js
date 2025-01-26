const { string } = require("joi");
const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    from: {
      type: String
    },
    message: { type: String, required: true },
    fypName: { type: String },
    fypId: { type: mongoose.Schema.Types.ObjectId, ref: "Fyp" },
    read: { type: Boolean, default: false },
    url: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Create the Notification model
const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;
