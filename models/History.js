const mongoose = require("mongoose");

const HistorySchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    required: true
  },

  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  gptNote: { type: Object, required: true },  // ONLY GPT note JSON

  followUpDate: { type: Date, default: null },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("History", HistorySchema);
