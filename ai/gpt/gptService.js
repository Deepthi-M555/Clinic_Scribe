// /ai/gpt/gptService.js

require("dotenv").config();
const {
  buildSystemMessage,
  buildUserMessage,
  REQUIRED_KEYS
} = require("./prompt");

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

function safeISONowUTC() {
  return new Date().toISOString().replace(/\.\d+Z$/, "Z");
}

// ------------------- CALL GROQ -------------------
async function callGroq(systemMsg, userMsg) {
  const body = {
    model: GROQ_MODEL,
    messages: [
      { role: "system", content: systemMsg },
      { role: "user", content: userMsg }
    ],
    temperature: 0,
    max_tokens: 2500
  };

  const resp = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${GROQ_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!resp.ok) {
    throw new Error(`Groq API error: ${resp.status} - ${await resp.text()}`);
  }

  const data = await resp.json();
  return data.choices[0].message.content;
}

// ------------------- VALIDATE JSON -------------------
function parseAndValidateJSON(raw) {
  let json;

  try {
    json = JSON.parse(raw);
  } catch {
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Invalid JSON from Groq");
    json = JSON.parse(match[0]);
  }

  // Safety defaults
  if (!json.patient) json.patient = {};
  if (!json.history) json.history = [];
  if (!json.vitals) json.vitals = {};
  if (!json.suggested_medications) json.suggested_medications = [];
  if (!json.red_flags) json.red_flags = [];
  if (!json.differential_diagnosis) json.differential_diagnosis = [];
  if (!json.patient_friendly_summary) json.patient_friendly_summary = "";
  if (!json.medication_warnings) json.medication_warnings = [];
  if (!json.icd10_codes) json.icd10_codes = [];

  json.timestamp = safeISONowUTC();

  return json;
}

// ------------------- MAIN FUNCTION -------------------
async function generateClinicalNote(transcript, meta = {}) {
  const systemMsg = buildSystemMessage();
  const userMsg = buildUserMessage(transcript, meta);

  const raw = await callGroq(systemMsg, userMsg);
  const json = parseAndValidateJSON(raw);

  json.clinic_name = meta.clinic_name || "";
  json.doctor_name = meta.doctor_name || "";

  json.patient = {
    name: meta.name || "",
    age: meta.age || "",
    sex: meta.sex || ""
  };

  json.history = Array.isArray(meta.history) ? meta.history : [];

  return json;
}

module.exports = { generateClinicalNote };