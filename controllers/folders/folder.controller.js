const Folder = require("../../models/folders/folder.model");

// Add a new batch (folder) with initial details
const folder = async (req, res) => {
  try {
    const { batchNo, department, courseName, semester, session, timing } =
      req.body;

    // Validate required fields
    if (
      !batchNo ||
      !department ||
      !courseName ||
      !semester ||
      !session ||
      !timing
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Create a new batch
    const newFolder = new Folder({
      batchNo,
      department,
      courseName,
      semester,
      session,
      timing,
      quizzes: [], // Empty array for quizzes
      assignments: [], // Empty array for assignments
      lectures: [], // Empty array for lectures
      marks: [], // Empty array for marks
    });

    // Save the new batch to the database
    await newFolder.save();

    return res.status(201).json({
      message: "Batch created successfully.",
      status_code: 201,
      batch: newFolder, // Optionally return the created batch object
    });
  } catch (error) {
    console.error("Error during folder creation:", error);
    return res.status(500).json({ message: "Server error, please try again" });
  }
};


module.exports = {
  folder,
};
