const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes/authRoute");
const todoRoutes = require("./routes/todoRoutes/todoRoute")
const logRequest = require("./utills/logger");
const authMiddleware = require("./middlewares/auth-middle-ware")
const folderRoutes = require("./routes/folders/folderRoutes")

// Initialize Express app
const app = express();

// CORS configuration
const corsOptions = {
  origin: "http://localhost:4200", // Frontend URL (e.g., React app running on port 3001)
  methods: "GET,POST",
  allowedHeaders: "Content-Type,Authorization",
};

app.use(logRequest);

// Enable CORS with the specified options
app.use(cors(corsOptions));


// Middleware
app.use(bodyParser.json()); // To parse JSON body
app.use(bodyParser.urlencoded({ extended: true }));

// MongoDB connection
mongoose
  .connect("mongodb://localhost:27017/folder-management-system", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log(err));

// Routes

app.use(authMiddleware);
app.use("/auth", authRoutes);
app.use("/todo", todoRoutes);
app.use("/folder", folderRoutes);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
