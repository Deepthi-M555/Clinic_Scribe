// routes/auth.js
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const TokenBlacklist = require("../models/TokenBlacklist");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// Utility: create JWT
function createToken(userId) {
  const expiresIn = process.env.JWT_EXPIRY || "7d"; // e.g. "7d" or "1d"
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn });
  return { token, expiresIn };
}

// -------------------- SIGNUP --------------------
/**
 * POST /auth/signup
 * body: { name, email, password, hospital, phone }
 */
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, hospital, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ ok: false, error: "Name, email and password are required" });
    }

    // Normalize email
    const emailLower = email.toLowerCase().trim();

    // Check existing
    const existing = await User.findOne({ email: emailLower });
    if (existing) return res.status(400).json({ ok: false, error: "Email already registered" });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    const user = new User({
      name: name.trim(),
      email: emailLower,
      passwordHash,
      hospital: hospital ? hospital.trim() : "",
      phone: phone ? phone.trim() : ""
    });

    await user.save();

    // Create token
    const { token, expiresIn } = createToken(user._id);

    // Return safe user object and token
    return res.status(201).json({
      ok: true,
      token,
      expiresIn,
      user: { id: user._id, name: user.name, email: user.email, hospital: user.hospital, phone: user.phone }
    });
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ ok: false, error: "Signup failed" });
  }
});

// -------------------- LOGIN --------------------
/**
 * POST /auth/login
 * body: { email, password }
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ ok: false, error: "Email and password required" });

    const emailLower = email.toLowerCase().trim();
    const user = await User.findOne({ email: emailLower });
    if (!user) return res.status(401).json({ ok: false, error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(401).json({ ok: false, error: "Invalid credentials" });

    const { token, expiresIn } = createToken(user._id);

    return res.json({
      ok: true,
      token,
      expiresIn,
      user: { id: user._id, name: user.name, email: user.email, hospital: user.hospital, phone: user.phone }
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ ok: false, error: "Login failed" });
  }
});

// -------------------- LOGOUT --------------------
/**
 * POST /auth/logout
 * header: Authorization: Bearer <token>
 * We store token in blacklist with expiry so it can't be reused.
 */
router.post("/logout", authMiddleware, async (req, res) => {
  try {
    // Extract token raw from header
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
    if (!token) return res.status(400).json({ ok: false, error: "Token missing" });

    // Get expiry from token
    let decoded;
    try {
      decoded = jwt.decode(token, { complete: true }) || {};
    } catch (e) {
      decoded = {};
    }

    // compute expiry datetime
    let expiresAt = new Date();
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET); // to get exp (in seconds)
      if (payload && payload.exp) {
        expiresAt = new Date(payload.exp * 1000);
      } else {
        // fallback: 7 days from now
        expiresAt.setDate(expiresAt.getDate() + 7);
      }
    } catch (e) {
      // If verify fails (shouldn't here because authMiddleware passed) set a fallback expiry
      expiresAt.setDate(expiresAt.getDate() + 7);
    }

    // Add token to blacklist
    const entry = new TokenBlacklist({ token, expiresAt });
    await entry.save();

    return res.json({ ok: true, message: "Logged out successfully" });
  } catch (err) {
    console.error("Logout error:", err);
    return res.status(500).json({ ok: false, error: "Logout failed" });
  }
});

module.exports = router;
