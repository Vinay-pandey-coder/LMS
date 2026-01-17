// Role Middleware - Checks if user has the required role
// This middleware should be used AFTER authMiddleware

const roleMiddleware = (requiredRole) => {
  // Return a middleware function
  return (req, res, next) => {
    try {
      // Check if req.user exists (should be set by authMiddleware)
      if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      // Get the user's role from req.user
      const userRole = req.user.role;

      console.log('User role:', userRole, 'Required role:', requiredRole);

      // Check if user's role matches the required role
      if (userRole === requiredRole) {
        // Role matches, continue to next handler
        next();
      } else {
        // Role does not match, deny access
        return res.status(403).json({ message: `Access denied. Only ${requiredRole} can access this.` });
      }
    } catch (error) {
      console.error('Role check error:', error);
      return res.status(500).json({ message: 'Error checking role' });
    }
  };
};

module.exports = roleMiddleware;