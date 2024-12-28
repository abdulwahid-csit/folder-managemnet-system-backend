const jwt = require("jsonwebtoken");

// JWT secret key
const JWT_SECRET = "fms"; // Replace with process.env.JWT_SECRET for production

// Middleware to check the validity of the access token
const authMiddleware = (req, res, next) => {
  // Skip authentication routes
  if (req.path.startsWith("/auth")) {
    return next(); // Proceed to the next middleware for authentication routes
  }

  // Check if the Authorization header contains a token
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res
      .status(401)
      .json({ message: "No token provided. Access denied." });
  }

  // Verify the token
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Attach user data to the request object
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    return res
      .status(401)
      .json({ message: "Invalid or expired token. Access denied." });
  }
};

module.exports = authMiddleware;
