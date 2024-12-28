const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
  fileName: { type: String, required: true }, // Name of the file
  fileUrl: { type: String, required: true }, // URL or path of the file
  uploadedAt: { type: Date, default: Date.now }, // When the file was uploaded
});

// Define schema for quizzes, assignments, lectures, etc. with marks and other metadata
const quizSchema = new mongoose.Schema({
  quizName: { type: String, required: true }, // Name of the quiz
  file: { type: fileSchema, required: true }, // PDF file for the quiz
  minMarks: { type: Number, required: true }, // Minimum marks for the quiz
  maxMarks: { type: Number, required: true }, // Maximum marks for the quiz
  totalMarks: { type: Number, required: true }, // Total marks for the quiz
});

const assignmentSchema = new mongoose.Schema({
  assignmentName: { type: String, required: true }, // Name of the assignment
  file: { type: fileSchema, required: true }, // PDF file for the assignment
  minMarks: { type: Number, required: true }, // Minimum marks for the assignment
  maxMarks: { type: Number, required: true }, // Maximum marks for the assignment
  totalMarks: { type: Number, required: true }, // Total marks for the assignment
});

const midExame = new mongoose.Schema({
  file: { type: fileSchema, required: true }, // PDF file for the assignment
  totalMarks: { type: Number, required: true }, // Total marks for the assignment
});


const finalExam = new mongoose.Schema({
  file: { type: fileSchema, required: true }, // PDF file for the assignment
  totalMarks: { type: Number, required: true }, // Total marks for the assignment
});




const lectureSchema = new mongoose.Schema({
  lectureName: { type: String, required: true }, // Name of the lecture
  file: { type: fileSchema, required: true }, // PDF file for the lecture
//   duration: { type: String, required: true }, // Duration of the lecture
  lectureDate: { type: Date, required: true }, // Date of the lecture
});


const folderSchema = new mongoose.Schema(
  {
    batchNo: { type: String, required: true },
    department: { type: String, required: true },
    courseName: { type: String, required: true },
    semester: { type: Number, required: true },
    session: { type: String, required: true },
    timing: { type: String, required: true },

    quizzes: [quizSchema], 
    assignments: [assignmentSchema], 
    lectures: [lectureSchema], 
    midExame: [midExame], 
    finalExam: [finalExam], 
  },
  { timestamps: true }
);

// Create and export the model for Batch
const Folder = mongoose.model("Folders", folderSchema);

module.exports = Folder;