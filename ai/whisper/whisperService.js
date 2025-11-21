require("dotenv").config();
const fs = require("fs");
const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

async function transcribeAudio(audioFilePath) {
  try {
    const response = await groq.audio.transcriptions.create({
      file: fs.createReadStream(audioFilePath), // FIXED
      model: "whisper-large-v3",
      response_format: "text"
    });

    return response;
  } catch (error) {
    console.error("Whisper Error:", error);
    throw new Error("Failed to transcribe audio");
  }
}

module.exports = { transcribeAudio };