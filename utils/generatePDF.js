const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");

module.exports = async function generatePDF(note) {
  try {
    // -------------------------------
    // Ensure PDFs folder exists
    // -------------------------------
    const pdfFolder = path.join(__dirname, "..", "pdfs");
    if (!fs.existsSync(pdfFolder)) fs.mkdirSync(pdfFolder);

    // -------------------------------
    // Load HTML template
    // -------------------------------
    const templatePath = path.join(__dirname, "..", "templates", "noteTemplate.html");

    if (!fs.existsSync(templatePath)) {
      throw new Error("Template file not found: " + templatePath);
    }

    let html = fs.readFileSync(templatePath, "utf8");

    // -------------------------------
    // Convert arrays into HTML
    // -------------------------------
    const historyHTML = Array.isArray(note.history)
      ? note.history
          .map((h) => `<li>${h}</li>`)
          .join("")
      : "";

    const redFlagsHTML = Array.isArray(note.red_flags)
      ? note.red_flags.map((f) => `<li>${f}</li>`).join("")
      : "";

    const diffDiagnosisHTML = Array.isArray(note.differential_diagnosis)
      ? note.differential_diagnosis.map((d) => `<li>${d}</li>`).join("")
      : "";

    const medicationHTML = Array.isArray(note.suggested_medications)
      ? note.suggested_medications
          .map(
            (m) =>
              `<tr><td>${m.name}</td><td>${m.dosage}</td><td>${m.duration}</td></tr>`
          )
          .join("")
      : "";

    // -------------------------------
    // Replace ALL placeholders
    // -------------------------------
    const replacements = {
      "{{clinic_name}}": note.clinic_name || "",
      "{{doctor_name}}": note.doctor_name || "",
      "{{phone}}": note.phone || "",
      "{{timestamp}}": note.timestamp || "N/A",
      "{{chief_complaint}}": note.chief_complaint || "",
      "{{follow_up}}": note.follow_up || "",
      "{{patient_summary}}": note.patient_summary || "",
      "{{examination_findings}}": note.examination_findings || "",
      "{{assessment}}": note.assessment || "",
      "{{diagnosis}}": note.diagnosis || "",
      "{{patient_friendly_summary}}": note.patient_friendly_summary || "",
      "{{lab_technician}}": note.lab_technician || "",

      // Dot-notation fields
      "{{patient.name}}": note.patient?.name || "",
      "{{patient.age}}": note.patient?.age || "",
      "{{patient.sex}}": note.patient?.sex || "",

      // Vitals
      "{{vitals.temperature}}": note.vitals?.temperature || "",
      "{{vitals.pulse}}": note.vitals?.pulse || "",
      "{{vitals.blood_pressure}}": note.vitals?.blood_pressure || "",
      "{{vitals.respiratory_rate}}": note.vitals?.respiratory_rate || "",

      // Generated lists
      "{{history}}": historyHTML,
      "{{red_flags}}": redFlagsHTML,
      "{{suggested_medications}}": medicationHTML,
      "{{differential_diagnosis}}": diffDiagnosisHTML,
    };

    // APPLY ALL REPLACEMENTS
    for (const key in replacements) {
      html = html.replace(new RegExp(key, "g"), replacements[key]);
    }

    // -------------------------------
    // Generate PDF filename
    // -------------------------------
    const filename = `note-${note._id || Date.now()}.pdf`;
    const pdfPath = path.join(pdfFolder, filename);

    // -------------------------------
    // Launch Puppeteer
    // -------------------------------
    const browser = await puppeteer.launch({
     headless: true,
     executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
     args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage"
     ]
  });


    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    // Generate PDF
    await page.pdf({
      path: pdfPath,
      format: "A4",
      printBackground: true,
    });

    await browser.close();

    // Return relative path for frontend
    return `/pdfs/${filename}`;
  } catch (err) {
    console.log("PDF ERROR:", err);
    throw err;
  }
};
