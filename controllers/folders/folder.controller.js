const Folder = require("../../models/folders/folder.model");
const path = require("path");
const fs = require('fs');
const User = require("./../../models/User/user.modal")
const Notification = require("../../models/notifications/notification.modal");
const { sendNotificationEmail } = require('../../utills/services/email.service');

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

    // Get the userId from the decoded token (set by your auth middleware)
    const userId = req.user.userId;

    // Create a new folder
    const newFolder = new Folder({
      batchNo,
      department,
      courseName,
      semester,
      session,
      timing,
      userId, // Associate folder with the user
      quizzes: [], // Empty array for quizzes
      assignments: [], // Empty array for assignments
      lectures: [], // Empty array for lectures
      marks: [], // Empty array for marks
    });

    // Save the new folder to the database
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


const getFolders = async (req, res) => {
  try {
    const userId = req.user.userId; 
    const limit = parseInt(req.query.limit) || 20;  
    const _id = req.query.id;
    if (_id) {
      const folders = await Folder.find({_id}).exec();
      return res.status(200).json({
        message: "Folder fetched successfully.",
        status_code: 200,
        folders,
      });
    }
    const search = req.query.search || ""; 

    let filter = { userId }; 

    if (search) {
      const searchRegex = new RegExp(search, "i"); 
      filter.$or = [
        { batchNo: { $regex: searchRegex } },
        { department: { $regex: searchRegex } },
        { courseName: { $regex: searchRegex } },
        { session: { $regex: searchRegex } },
      ];
    }

    const folders = await Folder.find(filter).limit(limit).sort({createdAt: -1}).exec();

    if (!folders || folders.length === 0) {
      return res.status(404).json({ message: "No folders found" });
    }

    return res.status(200).json({
      message: "Folders fetched successfully.",
      status_code: 200,
      folders,
    });
  } catch (error) {
    console.error("Error while fetching folders:", error);
    return res.status(500).json({ message: "Server error, please try again" });
  }
};



const deleteFolder = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Folder ID IS: ", id);
    const folder = await Folder.findByIdAndDelete(id);
    if (!folder) {
      return res.status(404).json({ message: "Folder not found" });
    }
    return res.status(200).json({
      message: "Folder deleted successfully.",
    });
  } catch (error) {
    console.error("Error while deleting folder:", error);
    return res.status(500).json({ message: "Server error, please try again" });
  }
};







// Function to add content (quiz, assignment, etc.) to an existing folder
const addContentToFolder = async (req, res) => {
  try {
    // Get the folder ID and content type (quiz, assignment, etc.) from the request body
    const {
      folderId,
      contentType,
      name,
      minMarks,
      maxMarks,
      totalMarks,
      lectureDate,
    } = req.body;
    const file = req?.file?.filename; // The file uploaded via Multer
    console.log("File: ", req.file);

    if (!folderId || !contentType || !name) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if the folder exists
    const folder = await Folder.findById(folderId);
    if (!folder) {
      return res.status(404).json({ message: "Folder not found" });
    }

    const fileUrl = `uploads/${file?.filename}`;

    let contentData;
    if (contentType === "quizzes") {
      contentData = {
        quizName: name,
        file: {
          name: name,
          fileUrl: file,
          uploadedAt: Date.now(),
        },
        minMarks,
        maxMarks,
        totalMarks: totalMarks,
      };
      folder.quizzes.push(contentData);
    } else if (contentType === "assignments") {
      contentData = {
        assignmentName: name,
        file: {
          name: name,
          fileUrl: file,
          uploadedAt: Date.now(),
        },
        minMarks,
        maxMarks,
        totalMarks: totalMarks,
      };
      folder.assignments.push(contentData);
    } else if (contentType === "lectures") {
      contentData = {
        file: {
          name: name,
          fileUrl: fileUrl,
          uploadedAt: Date.now(),
        },
        lectureDate,
      };
      folder.lectures.push(contentData);
    } else if (contentType === "midExame") {
      contentData = {
        file: {
          name: name,
          fileUrl: fileUrl,
          uploadedAt: Date.now(),
        },
        lectureDate,
      };
      folder.midExame.push(contentData);
    } else if (contentType === "finalExam") {
      contentData = {
        file: {
          name: name,
          fileUrl: fileUrl,
          uploadedAt: Date.now(),
        },
        lectureDate,
      };
      folder.finalExam.push(contentData);
    } else {
      return res.status(400).json({ message: "Invalid content type" });
    }

    // Save the folder with the new content
    await folder.save();

    return res.status(200).json({
      message: `${
        contentType.charAt(0).toUpperCase() + contentType.slice(1)
      } added successfully.`,
      status_code: 200,
      folder,
    });
  } catch (error) {
    console.error("Error while adding content to folder:", error);
    return res.status(500).json({ message: "Server error, please try again" });
  }
};


const updateContentInFolder = async (req, res) => {
  try {
    // Get the folder ID, content type, and content ID from the request body
    const {
      folderId,
      contentType,
      contentId,
      name,
      // minMarks,
      // maxMarks,
      totalMarks,
      lectureDate,
    } = req.body;
    const file = req.file ? req.file?.filename : null; // The file uploaded via Multer (optional)

    console.log("File: ", req.file);

    if (!folderId || !contentType || !contentId) {
      return res
        .status(400)
        .json({
          message: "Folder ID, content type, and content ID are required",
        });
    }

    // Check if the folder exists
    const folder = await Folder.findById(folderId);
    if (!folder) {
      return res.status(404).json({ message: "Folder not found" });
    }

    // Find the content in the specified folder and content type
    let contentData;
    if (contentType === "quizzes") {
      contentData = folder.quizzes.id(contentId); // Use the contentId to find the quiz content
    } else if (contentType === "assignments") {
      contentData = folder.assignments.id(contentId); // Use the contentId to find the assignment content
    } else if (contentType === "lectures") {
      contentData = folder.lectures.id(contentId); // Use the contentId to find the lecture content
    } else if (contentType === "midExame") {
      contentData = folder.midExame.id(contentId); // Use the contentId to find the midExam content
    } else if (contentType === "finalExam") {
      contentData = folder.finalExam.id(contentId); // Use the contentId to find the finalExam content
    } else {
      return res.status(400).json({ message: "Invalid content type" });
    }

    if (!contentData) {
      return res.status(404).json({ message: "Content not found" });
    }

    // Update the content based on the provided fields
    // contentData.name = name || contentData.name; // Only update if provided
    // contentData.minMarks = minMarks || contentData.minMarks;
    // contentData.maxMarks = maxMarks || contentData.maxMarks;
    // contentData.totalMarks = totalMarks || contentData.totalMarks;
    // contentData.lectureDate = lectureDate || contentData.lectureDate;

    // If a new file is uploaded, update the file URL
    if (file) {
      contentData.file = {
        name: name,
        fileUrl: `${file}`,
        uploadedAt: Date.now(),
      };
    }

    // Save the folder with the updated content
    await folder.save();

    return res.status(200).json({
      message: `${
        contentType.charAt(0).toUpperCase() + contentType.slice(1)
      } updated successfully.`,
      status_code: 200,
      folder,
    });
  } catch (error) {
    console.error("Error while updating content in folder:", error);
    return res.status(500).json({ message: "Server error, please try again" });
  }
};

const downloadFile = async (req, res) => {
  const fileName = req.params.fileName;

  const filePath = path.join(__dirname, "..", "..", "uploaded-files", fileName); // This will move one level up to the root directory

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: "File not found" });
  }

  res.download(filePath, fileName, (err) => {
    if (err) {
      console.error("Error downloading file:", err);
      return res
        .status(500)
        .json({ message: "Error while downloading the file" });
    }
  });
};


const updateFolder = async (req, res) => {
  try {
    const { batchNo, department, courseName, semester, session, timing } =
      req.body;

    const { folderId } = req.params;

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

    const userId = req.user.userId;

    const folder = await Folder.findOne({ _id: folderId, userId });

    if (!folder) {
      return res.status(404).json({ message: "Folder not found" });
    }

    folder.batchNo = batchNo;
    folder.department = department;
    folder.courseName = courseName;
    folder.semester = semester;
    folder.session = session;
    folder.timing = timing;

    await folder.save();

    return res.status(200).json({
      message: "Folder updated successfully.",
      status_code: 200,
      batch: folder, 
    });
  } catch (error) {
    console.error("Error during folder update:", error);
    return res.status(500).json({ message: "Server error, please try again" });
  }
};




const shareFolderWithUser = async (req, res) => {
  try {
    const { folderId, email } = req.body;

    if (!folderId || !email) {
      return res
        .status(400)
        .json({ message: "Folder ID and email are required." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const folder = await Folder.findById(folderId);
    if (!folder) {
      return res.status(404).json({ message: "Folder not found." });
    }

    if (folder.sharedWith.includes(user._id)) {
      return res
        .status(400)
        .json({ message: "User already has access to this folder." });
    }

    folder.sharedWith.push(user._id);

    // Save the updated folder
    await folder.save();

    // await sendNotificationEmail(email, user.username, folder.batchNo);

    const notification = new Notification({
      userId: user._id,
      message: `You have been granted access to the Folder "${folder.batchNo}".`,
      folderName: folder.batchNo,
      fypId: folder._id,
      url: "/layout/folders",
    });

    await notification.save();

    return res.status(200).json({
      message: "Folder shared successfully with the user.",
      folder,
    });
  } catch (error) {
    console.error("Error sharing folder with user:", error);
    return res.status(500).json({ message: "Server error, please try again." });
  }
};


const getFoldersSharedWithUser = async (req, res) => {
  try {
    const folders = await Folder.find({ sharedWith: req.user.userId });

    return res.status(200).json({
      success: true,
      message: "Folders retrieved successfully",
      data: folders
    });
  } catch (error) {
    console.error("Error fetching folders:", error);

    return res.status(500).json({
      success: false,
      message: "Error fetching folders",
      error: error.message,
    });
  }
};


const addCustomFileToFolder = async (req, res) => {
  try {
    const { folderId, name } = req.body;
    const file = req?.file?.filename;

    console.log("File: ", req.file);

    if (!folderId || !name) {
      return res
        .status(400)
        .json({ message: "Folder ID and file name are required" });
    }

    // Check if the folder exists
    const folder = await Folder.findById(folderId);
    if (!folder) {
      return res.status(404).json({ message: "Folder not found" });
    }

    const fileUrl = `${file}`; 

    const customFileData = {
        name: name,
        fileUrl: fileUrl,
        uploadedAt: Date.now(),
    };

    if(!fileUrl){
      delete customFileData.fileUrl;
    }

    folder.customFiles.push(customFileData);

    // Save the folder with the new custom file
    await folder.save();

    return res.status(200).json({
      message: "Custom file added successfully.",
      status_code: 200,
      folder,
    });
  } catch (error) {
    console.error("Error while adding custom file to folder:", error);
    return res.status(500).json({ message: "Server error, please try again" });
  }
};




module.exports = {
  folder,
  getFolders,
  deleteFolder,
  addContentToFolder,
  updateContentInFolder,
  downloadFile,
  updateFolder,
  shareFolderWithUser,
  getFoldersSharedWithUser,
  addCustomFileToFolder,
};

