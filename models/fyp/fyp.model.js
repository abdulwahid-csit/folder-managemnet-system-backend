const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema({
  rollNo: { type: String, required: true },
  marks: { type: Number, default: 0 },
  attendeceCount: { type: Number, default: 0 },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  is_marking_is_marked : {type: Boolean, default: false},
});

const attendanceSchema = new mongoose.Schema({
  studentNames: { type: String },
  description: { type: String },
  date: { type: Date, default: Date.now },
  file: { type: String },
});

const fypSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sharedWith: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    fypName: { type: String, required: true },
    session: { type: String, required: true },
    meetings: { type: Number, required: true },
    fypMembersCount: { type: Number, required: true },
    fypDescription: { type: String, required: true },
    endDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["completed", "In Progress", "On Hold"],
      required: true,
    },
    members: [memberSchema],
    attendance: [attendanceSchema],
  },
  { timestamps: true }
);

const Fyp = mongoose.model("Fyp", fypSchema);

module.exports = Fyp;
