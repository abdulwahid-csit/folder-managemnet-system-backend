const jwt = require("jsonwebtoken");
const { ConnectionStates } = require("mongoose");

const JWT_SECRET = "fms";

const authMiddleware = (req, res, next) => {
  if (req.path.startsWith("/auth")) {
    return next(); // Proceed to the next middleware for authentication routes
  }

  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res
      .status(401)
      .json({ message: "No token provided. Access denied." });
  }

  // Verify the token
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    console.log("User access tokn: ", req.user);
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ message: "Invalid or expired token. Access denied." });
  }
};

module.exports = authMiddleware;
