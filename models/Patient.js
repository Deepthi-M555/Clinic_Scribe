// models/Patient.js
const mongoose = require("mongoose");

// Create Patient Schema
const PatientSchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  // Basic patient info
  name: { type: String, required: true, trim: true },
  dob: { type: Date, required: true },
  sex: { type: String, default: "" },
  phone: { type: String, default: "" },

  // Public Patient ID shown in UI
  patientId: { type: String, unique: true },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Auto-update updatedAt
PatientSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

// Auto-generate patientId if missing
PatientSchema.pre("save", async function (next) {
  if (!this.patientId) {
    const count = await mongoose.model("Patient").countDocuments();
    this.patientId = `PAT-${String(count + 1).padStart(5, "0")}`;
  }
  next();
});

module.exports = mongoose.model("Patient", PatientSchema);
