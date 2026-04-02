import jwt from "jsonwebtoken";

// checks if they are logged in at all?
export const verifyToken = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1]; // Gets token from "Bearer <token>"

  if (!token) {
    return res.status(401).json({ message: "Access Denied. No token provided." });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified; // Attaches the user payload (id, role) to the request
    next(); // Let them pass!
  } catch (err) {
    res.status(403).json({ message: "Invalid or expired token." });
  }
};

// checks: Are they an Admin?
export const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access Denied. Admins only." });
  }
  next();
};

// checks : Are they a Creator?
export const isCreator = (req, res, next) => {
  // Admins can usually do creator things too, so we let both pass
  if (req.user.role !== "creator" && req.user.role !== "ContentCreator" && req.user.role !== "admin") {
    return res.status(403).json({ message: "Access Denied. Creators only." });
  }
  next();
};