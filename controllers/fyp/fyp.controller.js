const Fyp = require("../../models/fyp/fyp.model");
const User = require("./../../models/User/user.modal");
const Notification = require('../../models/notifications/notification.modal');
// const { emitEvent, emitToUser } = require('../../utills/services/socket.io.service');
const { sendNotificationEmail } = require('../../utills/services/email.service');
const createFyp = async (req, res) => {
  try {
    // Extract the FYP data from the request body
    const {
      fypName,
      fypMembersCount,
      fypDescription,
      endDate,
      status,
      members,
      session
    } = req.body;

    const userId = req.user.userId;
    // Validate required fields
    if (
      !fypName ||
      !fypDescription ||
      !endDate ||
      !members ||
      members.length === 0
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Create a new FYP object
    const newFyp = new Fyp({
      fypName,
      fypMembersCount: fypMembersCount || 1,
      fypDescription,
      endDate,
      status: status || "In Progress",
      members: members, // Set the array of members
      userId,
      session,
    });

    await newFyp.save();

    // Return success response with the created FYP
    return res.status(201).json({
      message: "FYP created successfully.",
      status_code: 201,
      fyp: newFyp,
    });
  } catch (error) {
    console.error("Error during FYP creation:", error);
    return res.status(500).json({ message: "Server error, please try again." });
  }
};


const getFypsByUser = async (req, res) => {
  try {
    const userId = req.user.userId;
    const fyps = await Fyp.find({ userId }).sort({ createdAt: -1 }).exec();

    if (!fyps || fyps.length === 0) {
      return res.status(404).json({ message: "No FYPs found for this user." });
    }

    return res.status(200).json({
      message: "FYPs retrieved successfully.",
      status_code: 200,
      fyps, 
    });
  } catch (error) {
    console.error("Error retrieving FYPs:", error);
    return res.status(500).json({ message: "Server error, please try again." });
  }
};


const getFypById = async (req, res) => {
  try {
    const userId = req.user.userId;

    const { id } = req.query;
    const fyp = await Fyp.findOne({ _id: id, userId }).exec();

    if (!fyp) {
      return res.status(404).json({ message: "FYP not found for this user." });
    }

    return res.status(200).json({
      message: "FYP retrieved successfully.",
      status_code: 200,
      fyp,
    });
  } catch (error) {
    console.error("Error retrieving FYP:", error);
    return res.status(500).json({ message: "Server error, please try again." });
  }
};



const addAttendance = async (req, res) => {
  const { fypId, studentNames, date, description } = req.body;

const file = req?.file?.filename;
  try {
    const fyp = await Fyp.findById(fypId);

    if (!fyp) {
      return res.status(404).json({ message: "FYP not found" });
    }

    const attendanceRecord = {
      studentNames,
      date,
      description,
      file
    };
    if(!file){
        delete attendanceRecord.file;
    }

    fyp.attendance.push(attendanceRecord);

    await fyp.save();

    return res
      .status(200)
      .json({ message: "Attendance added successfully", fyp });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};


const deleteFyp = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("TODO ID IS: ", id);

    // Find the todo by ID and delete it
    const todo = await Fyp.findByIdAndDelete(id);

    if (!todo) {
      return res.status(404).json({ message: "FYP not found" });
    }

    return res.status(200).json({
      message: "FYP deleted successfully.",
    });
  } catch (error) {
    console.error("Error while deleting FYP:", error);
    return res.status(500).json({ message: "Server error, please try again" });
  }
};
const deleteFypAttendence = async (req, res) => {
  try {
    const  ids  = req.params?.id; 

    [idPart, attendanceIdPart] = ids.split(".");;

    const id = idPart;
    const attendanceId = attendanceIdPart;
 
    console.log("FYP ID is: ", id); 

    const fyp = await Fyp.findById(id);
    if (!fyp) {
      return res.status(404).json({ message: "FYP not found" });
    }

    console.log("Current Attendance: ", fyp.attendance);

    const updatedAttendance = fyp.attendance.filter(
      (item) => item._id != attendanceId
    );

    fyp.attendance = updatedAttendance;
    await fyp.save();

    return res.status(200).json({
      message: "Attendance deleted successfully.",
      data: updatedAttendance,
    });
  } catch (error) {
    console.error("Error while deleting FYP attendance:", error);
    return res.status(500).json({ message: "Server error, please try again" });
  }
};



const downloadFile = async (req, res) => {
  const fileName = req.params.fileName;

  const filePath = path.join(__dirname, "..", "..", "uploaded-files", fileName);

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


const shareFyp = async (req, res) => {
  try {
    const { fypId, email } = req.body;

    if (!fypId || !email) {
      return res
        .status(400)
        .json({ message: "FYP ID and email are required." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const folder = await Fyp.findById(fypId);
    if (!folder) {
      return res.status(404).json({ message: "FYP not found." });
    }

    if (folder.sharedWith.includes(user._id)) {
      return res
        .status(400)
        .json({ message: "User already has access to this folder." });
    }

    folder.sharedWith.push(user._id);

    await folder.save();
    // await sendNotificationEmail(email, user.username, folder.fypName);

     const notification = new Notification({
       userId: user._id,
       message: `You have been granted access to the FYP "${folder.fypName}".`,
       folderName: folder.fypName,
       fypId: folder._id,
       url: "/layout/fyp",
     });

     await notification.save();


    return res.status(200).json({
      message: "Folder shared successfully with the user.",
      folder,
    });
  } catch (error) {
    console.error("Error sharing folder with user:", error);
    return res.status(500).json("Server error, please try again.");
  }
};


const getFypsSharedWithUser = async (req, res) => {
  try {
    const folders = await Fyp.find({ sharedWith: req.user.userId });

    return res.status(200).json({
      success: true,
      message: "Folders retrieved successfully",
      data: folders,
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



const updateFyp = async (req, res) => {
  try {
    const {
      fypName,
      fypMembersCount,
      fypDescription,
      endDate,
      status,
      members,
      session,
    } = req.body; 

    const { fypId } = req.params;

    if (
      !fypName ||
      !fypMembersCount ||
      !fypDescription ||
      !fypDescription ||
      !session ||
      !endDate ||
      !status ||
      !members
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const userId = req.user.userId;

    const fyp = await Fyp.findOne({ _id: fypId, userId });

    if (!fyp) {
      return res.status(404).json({ message: "Folder not found" });
    }

       fyp.fypName = fypName,
       fyp.fypMembersCount = fypMembersCount,
       fyp.fypDescription = fypDescription,
       fyp.endDate = endDate,
       fyp.status = status,
       fyp.members = members,
       fyp.session = session
       await fyp.save();

    return res.status(200).json({
      message: "Folder updated successfully.",
      status_code: 200,
      fyp: fyp,
    });
  } catch (error) {
    console.error("Error during folder update:", error);
    return res.status(500).json({ message: "Server error, please try again" });
  }
};



module.exports = {
  createFyp,
  getFypsByUser,
  getFypById,
  addAttendance,
  deleteFyp,
  downloadFile,
  deleteFypAttendence,
  shareFyp,
  getFypsSharedWithUser,
  updateFyp,
};
