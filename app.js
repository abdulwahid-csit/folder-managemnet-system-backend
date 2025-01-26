const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes/authRoute");
const todoRoutes = require("./routes/todoRoutes/todoRoute");
const logRequest = require("./utills/logger");
const authMiddleware = require("./middlewares/auth-middle-ware");
const folderRoutes = require("./routes/folders/folderRoutes");
const fypRoutes  = require("./routes/fyp/fyp.route")
const notificationRoutes  = require("./routes/notification/notifications.route")
const scheduleRoutes  = require("./routes/schedules/schedule.route")
const userRoutes = require("./routes/users/user.route")
// const http = require("http");
// const socketIo = require("socket.io");
const path = require("path");
// const { initSocket } = require('./utills/services/socket.io.service')

const app = express();

// const server = http.createServer(app); // Create an HTTP server
// const io = socketIo(server); 
// initSocket(io);

app.use(
  "/uploaded-files",
  express.static(path.join(__dirname, "uploaded-files"))
);

const corsOptions = {
  origin: "http://localhost:4200", // Frontend URL (e.g., React app running on port 3001)
  methods: "GET,POST, PUT, DELETE, OPTIONS",
  allowedHeaders: "Content-Type,Authorization",
};

app.use(cors(corsOptions));

// Log all incoming requests (for debugging purposes)
app.use(logRequest);

// Use body-parser for JSON and URL-encoded bodies (not for file upload route)
app.use(bodyParser.json()); // For JSON requests
app.use(bodyParser.urlencoded({ extended: true })); // For URL-encoded data

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
app.use("/fyp", fypRoutes);
app.use("/notification", notificationRoutes);
app.use("/schedule", scheduleRoutes);
app.use("/user", userRoutes);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
