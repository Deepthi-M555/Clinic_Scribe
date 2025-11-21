const { generateClinicalNote } = require("../ai/gpt/gptService");

async function main() {
  const transcript = `
  मरीज पिछले 3 दिनों से तेज बुखार और खांसी की शिकायत कर रहा है।
  आज तापमान 102F है और थोड़ा सांस फूल रहा है।
  Paracetamol देने को कहा और rest करने को बताया।
  Follow up tomorrow.
  `;

  const meta = {
    clinic_name: "City Health Clinic",
    doctor_name: "Dr. Manju",
    name: "Rahul",
    age: "35",
    sex: "M",
    history: ["Diabetes"]
  };

  const result = await generateClinicalNote(transcript, meta);
  console.log(JSON.stringify(result, null, 2));
}

main();
