const multer = require("multer");
const path = require("path");

// Correct path setup to point to the 'uploaded-files' folder at the root of the project
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Make sure the folder 'uploaded-files' exists at the root of the project
    const uploadPath = path.join(__dirname, "../uploaded-files"); // Use relative path to root folder
    cb(null, uploadPath); // Pass the correct folder path to multer
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    ); // Generate a unique filename
  },
});

// Initialize multer with the storage configuration
const upload = multer({ storage: storage });

module.exports = upload;
