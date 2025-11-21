export const formatWhatsAppMessage = (data) => {
  return `
🏥 *${data.clinic_name}*
👨‍⚕️ *Doctor:* ${data.doctor_name}

🧍 *Patient:* ${data.patient.name} (${data.patient.age}, ${data.patient.sex})
🕒 *Time:* ${data.timestamp}

📌 *Chief Complaint*
${data.chief_complaint}

📖 *History*
${data.history?.join(", ") || "None"}

🩺 *Vitals*
• Temp: ${data.vitals.temperature}
• Pulse: ${data.vitals.pulse}
• BP: ${data.vitals.blood_pressure}
• Resp: ${data.vitals.respiratory_rate || "N/A"}

🔍 *Examination Findings*
${data.examination_findings || "Not noted"}

🧠 *Assessment*
${data.assessment}

⚕️ *Diagnosis*
${data.diagnosis || "Not confirmed"}

📝 *Plan*
${data.plan}

💊 *Medications:*
${data.suggested_medications
    .map((m) => `• ${m.name} – ${m.dosage} (${m.duration})`)
    .join("\n")}

📅 *Follow Up:* ${data.follow_up}

📌 *Summary*
${data.patient_summary}

🚨 *Red Flags*
${data.red_flags?.join(", ")}

🔎 *Differential Diagnosis*
${data.differential_diagnosis?.join(", ")}

👤 *Patient-Friendly Summary*
${data.patient_friendly_summary}
  `;
};
