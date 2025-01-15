const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes/authRoute");
const todoRoutes = require("./routes/todoRoutes/todoRoute");
const logRequest = require("./utills/logger");
const authMiddleware = require("./middlewares/auth-middle-ware");
const folderRoutes = require("./routes/folders/folderRoutes");
const folderController = require("./controllers/folders/folder.controller");
const path = require("path");

const app = express();

app.use(
  "/uploaded-files",
  express.static(path.join(__dirname, "uploaded-files"))
);

const corsOptions = {
  origin: "http://localhost:4200", // Frontend URL (e.g., React app running on port 3001)
  methods: "GET,POST, PUT, DELETE, OPTIONS",
  allowedHeaders: "Content-Type,Authorization",
};

// Enable CORS with the specified options
app.use(cors(corsOptions));

// Log all incoming requests (for debugging purposes)
app.use(logRequest);

// Use body-parser for JSON and URL-encoded bodies (not for file upload route)
app.use(bodyParser.json()); // For JSON requests
app.use(bodyParser.urlencoded({ extended: true })); // For URL-encoded data

// MongoDB connection
mongoose
  .connect("mongodb://localhost:27017/folder-management-system", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log(err));



app.use(authMiddleware);
app.use("/auth", authRoutes);
app.use("/todo", todoRoutes);
app.use("/folder", folderRoutes);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
