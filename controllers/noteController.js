const { generateClinicalNote } = require("../ai/gpt/gptService");
const History = require("../models/History");
const Patient = require("../models/Patient");

// ---------------------------------------------------
// HISTORY FILTER LOGIC (chronic = full, acute = 1 month)
// ---------------------------------------------------
function filterHistory(transcript, fullHistory) {
  if (!Array.isArray(fullHistory)) return [];

  const text = transcript.toLowerCase();

  // Chronic condition keywords → send full history
  const chronicKeywords = [
    "diabetes", "sugar", "asthma", "hypertension", "bp problem",
    "thyroid", "hypothyroid", "hyperthyroid", "heart", "cardiac",
    "kidney", "renal", "ckd", "copd", "arthritis", "migraine",
    "epilepsy", "seizure", "pcod", "pcos", "cholesterol",
    "cancer", "tumor"
  ];

  // Acute condition keywords → send ONLY last 1 month history
  const acuteKeywords = [
    "fever", "cold", "cough", "viral", "flu", "infection",
    "throat", "headache", "stomach pain", "body pain",
    "vomiting", "diarrhea", "nausea", "loose motion"
  ];

  const isChronic = chronicKeywords.some(word => text.includes(word));
  const isAcute = acuteKeywords.some(word => text.includes(word));

  // If chronic → full history
  if (isChronic) {
    return fullHistory;
  }

  // If acute → return entries only from last 1 month
  if (isAcute) {
    return fullHistory.filter(entry => {
      if (!entry.createdAt) return false;
      const entryDate = new Date(entry.createdAt);
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      return entryDate >= oneMonthAgo;
    });
  }

  // Default: send all history
  return fullHistory;
}

// ---------------------------------------------------
// GENERATE CLINICAL NOTE FROM TRANSCRIPT (Step 4)
// ---------------------------------------------------
async function generateNote(req, res) {
  try {
    const { transcript, patientId } = req.body;

    if (!transcript) {
      return res.status(400).json({ ok: false, message: "Transcript required" });
    }

    // fetch patient meta for name/dob/sex
    let meta = {};
    if (patientId) {
      const patient = await Patient.findById(patientId).lean();
      if (patient) meta = { name: patient.name, dob: patient.dob, sex: patient.sex };
    }
// fetch existing GPT history (to apply filter)
    const rawHistory = await History.find({ patientId }).lean();
    // pass only gptNote with createdAt into fullHistory array for filtering
    const historyForFilter = rawHistory.map(h => ({ createdAt: h.createdAt, gptNote: h.gptNote }));

    const filteredHistory = filterHistory(transcript, historyForFilter);
    meta.history = filteredHistory;

    // call GPT service
    const clinicalNote = await generateClinicalNote(transcript, meta);

    // return note to frontend (no saving yet)
    return res.json({ ok: true, note: clinicalNote, meta });
  } catch (err) {
    console.error("Note generation error:", err);
    return res.status(500).json({ ok: false, error: "Failed to generate clinical note" });
  }
}

module.exports = { generateNote };