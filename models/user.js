const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  hospital: { type: String, default: "" },
  phone: { type: String, default: "" },
  role: { type: String, default: "doctor" },
  createdAt: { type: Date, default: Date.now }
});

// FIX: Prevent OverwriteModelError
module.exports = mongoose.models.User || mongoose.model("User", UserSchema);
