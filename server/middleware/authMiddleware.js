const jwt = require("jsonwebtoken");

const authmiddleware = (req, res, next) => {
  try {
    const authheader = req.headers.authorization;
    console.log("Authorization header:", authheader);

    if (!authheader) {
      console.log("No Token Provide");
      return res
        .status(401)
        .json({ message: "Access denied. No token provided." });
    }

    const path = authheader.split(" ");
    const token = path[1];

    if (!token) {
      console.log("Invalid token format");
      return res
        .status(401)
        .json({ message: "Invalid token format. Use Bearer TOKEN" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Token verified for user:", decoded);
    req.user = decoded;
    next();
  } catch (error) {
    console.log("Token verification failed:", error.message);

    // If token is invalid or expired
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token has expired" });
    }

    return res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = authmiddleware;
