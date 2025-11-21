import fs from "fs";
import path from "path";
import puppeteer from "puppeteer-core";
import QRCode from "qrcode";

// create simple SVG logo (blue cross) and signature SVG — return data URLs
const makeLogoDataUrl = () => {
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
    <rect rx="18" ry="18" width="200" height="200" fill="#005DAA"/>
    <g transform="translate(30,30)" fill="#fff">
      <rect x="50" y="0" width="40" height="120" rx="8" />
      <rect x="0" y="50" width="120" height="40" rx="8" />
    </g>
  </svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
};

const makeSignatureDataUrl = () => {
  // a stylized signature-like SVG text
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="600" height="140">
    <rect width="100%" height="100%" fill="transparent" />
    <g transform="translate(12,92)">
      <path d="M10 20 C 80 0, 140 40, 210 20 C 270 5, 340 38, 420 22" stroke="#0b3f82" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <text x="10" y="120" font-family="Segoe UI, Tahoma" font-size="20" fill="#0b3f82">Dr. Manju</text>
    </g>
  </svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
};

const makeWatermarkSvg = (clinicName) => {
  const text = (clinicName || "Medical Report").toUpperCase();
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">
    <defs>
      <filter id="f1"><feGaussianBlur stdDeviation="0.6"/></filter>
    </defs>
    <g fill="none" stroke="#0b62a6" stroke-width="6" opacity="0.9">
      <circle cx="400" cy="400" r="220" fill="none" />
      <circle cx="400" cy="400" r="160" fill="none" stroke-width="3" />
      <text x="400" y="400" text-anchor="middle" font-size="36" font-family="Segoe UI, Tahoma" fill="#0b62a6" opacity="0.9">${text}</text>
    </g>
  </svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
};

export const generateStyledPdf = async (data) => {
  // 1. read template
  const templatePath = path.resolve("src/templates/reportTemplate.html");
  let html = fs.readFileSync(templatePath, "utf8");

  // 2. create assets
  const logoDataUrl = makeLogoDataUrl();
  const signatureDataUrl = makeSignatureDataUrl();

  // generate QR (encode a short report id)
  const reportId = `${(data.patient?.name || "patient").replace(/\s+/g, "_")}_${Date.now()}`;
  const qrPayload = data.report_id || reportId;
  const qrDataUrl = await QRCode.toDataURL(String(qrPayload));

  // watermark SVG data URL (we will inject as inline <img> svg)
  const watermarkDataUrl = makeWatermarkSvg(data.clinic_name || "Clinic");

  // 3. Replace placeholders
  const replace = (key, value) => {
    html = html.replaceAll(`{{${key}}}`, value ?? "");
  };

  replace("LOGO_DATAURL", logoDataUrl);
  replace("SIGNATURE_DATAURL", signatureDataUrl);
  replace("QR_DATAURL", qrDataUrl);
  // watermark SVG: we will inject an <img src="data:image/svg+xml;base64,..." />
  replace("WATERMARK_SVG", `<img src="${watermarkDataUrl}" alt="watermark" style="width:520px;height:520px;opacity:0.9;" />`);

  replace("clinic_name", data.clinic_name || "");
  replace("doctor_name", data.doctor_name || "");
  replace("timestamp", data.timestamp || new Date().toISOString());
  replace("patient_summary", data.patient_summary || "");
  replace("assessment", data.assessment || "");
  replace("diagnosis", data.diagnosis || "");
  replace("chief_complaint", data.chief_complaint || "");
  replace("follow_up", data.follow_up || "");
  replace("examination_findings", data.examination_findings || "");
  replace("patient_friendly_summary", data.patient_friendly_summary || "");
  replace("phone", data.phone || "");
  replace("lab_technician", data.lab_technician || "");

  // patient fields
  replace("patient.name", data.patient?.name || "");
  replace("patient.age", data.patient?.age || "");
  replace("patient.sex", data.patient?.sex || "");

  // vitals
  replace("vitals.temperature", data.vitals?.temperature || "");
  replace("vitals.pulse", data.vitals?.pulse || "");
  replace("vitals.blood_pressure", data.vitals?.blood_pressure || "");
  replace("vitals.respiratory_rate", data.vitals?.respiratory_rate || "");

  // arrays -> lists or table rows
  html = html.replace("{{history}}",
    (data.history && data.history.length)
      ? data.history.map(h => `<li>${h}</li>`).join("")
      : "<li>None</li>"
  );

  html = html.replace("{{red_flags}}",
    (data.red_flags && data.red_flags.length)
      ? data.red_flags.map(r => `<li>${r}</li>`).join("")
      : "<li>None</li>"
  );

  html = html.replace("{{differential_diagnosis}}",
    (data.differential_diagnosis && data.differential_diagnosis.length)
      ? data.differential_diagnosis.map(d => `<li>${d}</li>`).join("")
      : "<li>None</li>"
  );

  html = html.replace("{{suggested_medications}}",
    (data.suggested_medications && data.suggested_medications.length)
      ? data.suggested_medications.map(m => `
        <tr>
          <td>${m.name}</td>
          <td>${m.dosage}</td>
          <td>${m.duration}</td>
        </tr>`).join("")
      : `<tr><td colspan="3">No medications</td></tr>`
  );

  // 4. Launch Puppeteer (use system chrome)
  const executablePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"; // change if needed

  const browser = await puppeteer.launch({
    headless: true,
    executablePath,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });

  // allow some time for fonts and images to settle
  // allow time for HTML, fonts, and images to fully render
await new Promise(res => setTimeout(res, 200));


  // 5. Produce PDF
  const outDir = path.resolve("reports");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const pdfPath = path.join(outDir, `styled_report_${Date.now()}.pdf`);
  await page.pdf({
    path: pdfPath,
    format: "A4",
    printBackground: true,
    margin: { top: "12mm", bottom: "18mm", left: "12mm", right: "12mm" }
  });

  await browser.close();
  return pdfPath;
};
