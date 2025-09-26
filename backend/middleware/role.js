const roleCheck = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }
    req.accessMessage = `Access granted for role: ${req.user.role}`;
    
    next();
  };
};

module.exports = roleCheck;
