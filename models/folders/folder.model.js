const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Name of the file
  fileUrl: { type: String, required: true }, // URL or path of the file
  uploadedAt: { type: Date, default: Date.now }, // When the file was uploaded
});

const quizSchema = new mongoose.Schema({
  quizName: { type: String, required: true }, // Name of the quiz
  file: { type: fileSchema }, // PDF file for the quiz
  minMarks: { type: Number,  }, // Minimum marks for the quiz
  maxMarks: { type: Number,  }, // Maximum marks for the quiz
  totalMarks: { type: String,  }, // Total marks for the quiz
  filePath: { type: String,  }, // Total marks for the quiz
});

const assignmentSchema = new mongoose.Schema({
  assignmentName: { type: String, required: true },
  file: { type: fileSchema },
  minMarks: { type: Number }, 
  maxMarks: { type: Number }, 
  totalMarks: {type:  String }, 
  filePath: { type: String }, 
});

const midExame = new mongoose.Schema({
  file: { type: fileSchema }, // PDF file for the assignment
  totalMarks: { type: Number, }, // Total marks for the assignment
});


const finalExam = new mongoose.Schema({
  file: { type: fileSchema}, // PDF file for the assignment
  totalMarks: { type: Number, }, // Total marks for the assignment
});




const lectureSchema = new mongoose.Schema({
  file: { type: fileSchema,  }, // PDF file for the lecture
  duration: { type: String }, // Duration of the lecture
  lectureDate: { type: Date,  }, // Date of the lecture
});


const folderSchema = new mongoose.Schema(
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
