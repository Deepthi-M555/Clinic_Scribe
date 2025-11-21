// middleware/auth.js
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const TokenBlacklist = require("../models/TokenBlacklist");

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
    if (!token) {
      return res.status(401).json({ ok: false, error: "No token, authorization denied" });
    }

    // Check token blacklist
    const blacklisted = await TokenBlacklist.findOne({ token }).lean();
    if (blacklisted) {
      return res.status(401).json({ ok: false, error: "Token has been revoked (logout)" });
    }

    // Verify token signature
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || !decoded.userId) {
      return res.status(401).json({ ok: false, error: "Invalid token" });
    }

    // Attach user to request (omit passwordHash)
    const user = await User.findById(decoded.userId).select("-passwordHash");
    if (!user) {
      return res.status(401).json({ ok: false, error: "User not found" });
    }

    req.user = { id: user._id, name: user.name, email: user.email, role: user.role };
    next();
  } catch (err) {
    console.error("Auth middleware error:", err.message || err);
    return res.status(401).json({ ok: false, error: "Token is not valid" });
  }
};

module.exports = authMiddleware;
