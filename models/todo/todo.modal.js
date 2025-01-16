// const mongoose = require("mongoose");

// // Define Todo schema
// const todoSchema = new mongoose.Schema({
//   title: { type: String, required: true },
//   description: { type: String, required: true },
//   date: { type: String, required: false },
//   reminderDate: { type: Date },
//   isCompleted: { type: Boolean },
//   creationDate: { type: Date, default: new Date() },
// });

// const Todo = mongoose.model("Todo", todoSchema);

// module.exports = Todo;
// // 

const mongoose = require("mongoose");

// Define Todo schema
const todoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: String, required: false },
    reminderDate: { type: Date },
    isCompleted: { type: Boolean, default: false },
    creationDate: { type: Date, default: new Date() },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the User model
      required: true,
    },
  },
  { timestamps: true }
);

const Todo = mongoose.model("Todo", todoSchema);

module.exports = Todo;
