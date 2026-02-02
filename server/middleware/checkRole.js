const checkRole = (requiredRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized: No user data' });
      }

      const rolesArray = Array.isArray(requiredRoles)
        ? requiredRoles
        : [requiredRoles];

      if (!rolesArray.includes(req.user.role)) {
        return res.status(403).json({
          message: `Forbidden: Required role(s): ${rolesArray.join(', ')}`,
        });
      }

      next();
    } catch (error) {
      console.error('Role check middleware error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };
};

module.exports = checkRole;