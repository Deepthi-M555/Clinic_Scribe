// test/listGroqModels.js

require("dotenv").config();

const GROQ_API_KEY = process.env.GROQ_API_KEY;

async function listModels() {
  const resp = await fetch("https://api.groq.com/openai/v1/models", {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${GROQ_API_KEY}`
    }
  });

  const data = await resp.json();
  console.log("\n=== AVAILABLE GROQ MODELS FOR YOUR ACCOUNT ===\n");
  console.log(data);
}

listModels();
