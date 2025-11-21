require("dotenv").config();
const { transcribeAudio } = require("../../ai/whisper/whisperService.js");

(async () => {
  try {
    const transcript = await transcribeAudio("./test/Recording.mp3");
    console.log("TRANSCRIPT RESULT:\n", transcript);
  } catch (error) {
    console.error("Error:", error);
  }
})();
