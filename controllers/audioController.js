const fs = require("fs");
const path = require("path");
const Patient = require("../models/Patient");

// Bring whisperService from your friend's AI folder
const { transcribeAudio } = require("../ai/whisper/whisperService");

// ---------------------------------------------
// UPLOAD AUDIO 
// ---------------------------------------------
async function uploadAudio(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ ok: false, message: "No file uploaded" });
    }

    return res.json({
      ok: true,
      message: "Audio uploaded successfully",
      filePath: req.file.path,
      fileName: req.file.filename
    });

  } catch (err) {
    console.error("Upload error:", err);
    return res.status(500).json({ ok: false, error: "Upload failed" });
  }
}

// ---------------------------------------------
// TRANSCRIBE AUDIO 
// ---------------------------------------------
async function transcribe(req, res) {
  try {
    const { filePath, patientId, meta } = req.body;

    if (!filePath) {
      return res.status(400).json({ ok: false, error: "filePath required" });
    }

    if (!fs.existsSync(filePath)) {
      return res.status(400).json({ ok: false, error: "Audio file not found" });
    }

    // ----------------------------------------
    // SAFE META INITIALIZATION (IMPORTANT FIX)
    // ----------------------------------------
    let safeMeta = meta || {};

    // Fetch patient meta only if meta NOT provided
    if (patientId && (!safeMeta.name || !safeMeta.dob || !safeMeta.sex)) {
      const patient = await Patient.findById(patientId).lean();

      if (patient) {
        safeMeta = {
          name: patient.name,
          dob: patient.dob,
          sex: patient.sex
        };
      }
    }

    // ----------------------------------------
    // CALL WHISPER (Groq)
    // ----------------------------------------
    const transcript = await transcribeAudio(filePath);

    // Delete temp file later
    setTimeout(() => {
      try { fs.unlinkSync(filePath); } catch (e) {}
    }, 20000);

    return res.json({
      ok: true,
      transcript,
      patientId,
      meta: safeMeta
    });

  } catch (err) {
    console.error("Transcription error:", err);
    return res.status(500).json({ ok: false, error: "Failed to transcribe" });
  }
};

module.exports = { uploadAudio, transcribe };
