const mongoose = require("mongoose");

const scheduleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["active", "completed", "canceled"],
      default: "active",
    },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Schedule", scheduleSchema);
