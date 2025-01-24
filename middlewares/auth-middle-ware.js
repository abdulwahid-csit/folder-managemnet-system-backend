const jwt = require("jsonwebtoken");
const { ConnectionStates } = require("mongoose");

const JWT_SECRET = "fms";

const authMiddleware = (req, res, next) => {

   if (
     req.headers.upgrade &&
     req.headers.upgrade.toLowerCase() === "websocket"
   ) {
     return next(); 
   }


  if (req.path.startsWith("/auth")) {
    return next();
  }
  if (req.path.startsWith("/socket.io/")) {
    return next();
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
