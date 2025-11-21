// models/TokenBlacklist.js
const mongoose = require("mongoose");

const TokenBlacklistSchema = new mongoose.Schema({
  token: { type: String, required: true, index: true },
  expiresAt: { type: Date, required: true }, // when the token naturally expires
  createdAt: { type: Date, default: Date.now }
});

// TTL index to auto-delete expired tokens (optional)
TokenBlacklistSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("TokenBlacklist", TokenBlacklistSchema);
