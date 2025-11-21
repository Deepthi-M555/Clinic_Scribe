// controllers/patientController.js
const Patient = require("../models/Patient");
const History = require("../models/History");

// ------------------------------------------------------------
// ADD PATIENT
// ------------------------------------------------------------
async function addPatient(req, res) {
  try {
    const doctorId = req.user.id;
    const { name, dob, sex, phone } = req.body;

    if (!name || !dob) {
      return res.status(400).json({ ok: false, message: "Name and DOB required" });
    }

    const newPatient = new Patient({
      doctorId,
      name,
      dob,
      sex,
      phone
    });

    await newPatient.save();

    return res.json({
      ok: true,
      patient: newPatient
    });

  } catch (err) {
    console.error("Add patient error:", err);
    return res.status(500).json({ ok: false, error: "Server error adding patient" });
  }
}

// ------------------------------------------------------------
// GET ALL PATIENTS
// ------------------------------------------------------------
async function getAllPatients(req, res) {
  try {
    const doctorId = req.user.id;

    const patients = await Patient.find({ doctorId })
      .sort({ updatedAt: -1 });

    return res.json({ ok: true, patients });
  } catch (err) {
    console.error("Error getting patients:", err);
    return res.status(500).json({ ok: false, error: "Failed to fetch patients" });
  }
}

// ------------------------------------------------------------
// GET SINGLE PATIENT + GPT HISTORY
// ------------------------------------------------------------
async function getPatient(req, res) {
  try {
    const doctorId = req.user.id;
    const { id } = req.params;

    const patient = await Patient.findOne({ _id: id, doctorId });

    if (!patient) {
      return res.status(404).json({ ok: false, message: "Patient not found" });
    }

    const history = await History.find({ patientId: id })
      .sort({ createdAt: -1 });

    return res.json({
      ok: true,
      patient,
      history
    });

  } catch (err) {
    console.error("Get patient error:", err);
    return res.status(500).json({ ok: false, error: "Failed to fetch patient" });
  }
}

// ------------------------------------------------------------
// ADD HISTORY (This was missing earlier!)
// ------------------------------------------------------------
async function addHistory(req, res) {
  try {
    const doctorId = req.user.id;
    const { patientId } = req.params;
    const { gptNote } = req.body;

    if (!gptNote) {
      return res.status(400).json({ ok: false, message: "GPT Note required" });
    }

    const patient = await Patient.findOne({ _id: patientId, doctorId });

    if (!patient) {
      return res.status(404).json({ ok: false, message: "Patient not found" });
    }

    const newHistory = new History({
      patientId,
      doctorId,
      gptNote
    });

    await newHistory.save();

    return res.json({
      ok: true,
      message: "History added",
      history: newHistory
    });

  } catch (err) {
    console.error("Add history error:", err);
    return res.status(500).json({ ok: false, error: "Failed to add history" });
  }
}

// ------------------------------------------------------------
module.exports = {
  addPatient,
  getAllPatients,
  getPatient,
  addHistory   // <-- This was missing!
};
