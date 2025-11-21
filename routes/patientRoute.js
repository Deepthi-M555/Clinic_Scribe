const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

const {
  addPatient,
  getAllPatients,
  getPatient,
  addHistory
} = require("../controllers/patientController");

// Add new patient
router.post("/add", auth, addPatient);

// Get all patients of logged-in doctor
router.get("/all", auth, getAllPatients);

// Get single patient + full GPT history
router.get("/:id", auth, getPatient);

// Add history (visit) to patient
router.post("/:patientId/history/add", auth, addHistory);

module.exports = router;
