const jwt = require('jsonwebtoken');

// This middleware checks if user has a valid token
const authMiddleware = (req, res, next) => {
  try {
    // Get the Authorization header
    // Format should be: "Bearer TOKEN"
    const authHeader = req.headers.authorization;

    console.log('Authorization header:', authHeader);

    // Check if Authorization header exists
    if (!authHeader) {
      console.log('No token provided');
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    // Split the header to get the token
    // authHeader is like "Bearer xyz123..."
    // We split by space and get the second part
    const parts = authHeader.split(' ');
    const token = parts[1];

    // Check if token exists (Bearer should have a second part)
    if (!token) {
      console.log('Invalid token format');
      return res.status(401).json({ message: 'Invalid token format. Use Bearer TOKEN' });
    }

    // Verify the token using JWT_SECRET
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log('Token verified for user:', decoded);

    // Attach decoded data to req.user
    // This makes the user info available to the next route handler
    req.user = decoded;

    // Continue to the next handler
    next();
  } catch (error) {
    console.log('Token verification failed:', error.message);

    // If token is invalid or expired
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token has expired' });
    }

    return res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = authMiddleware;