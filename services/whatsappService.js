import pkg from "whatsapp-web.js";
import qrcode from "qrcode-terminal";
import fs from "fs";
import { generateStyledPdf } from "../utils/generateStyledPdf.js";

const { Client, LocalAuth, MessageMedia } = pkg;

let client;

export const initWhatsApp = async () => {
  console.log("Starting WhatsApp Session...");

  client = new Client({
    authStrategy: new LocalAuth({
      clientId: "doctor-assistant"
    }),
    puppeteer: {
      headless: false,
      executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    }
  });

  client.on("qr", (qr) => {
    console.log("Scan this QR code:");
    qrcode.generate(qr, { small: true });
  });

  client.on("ready", () => {
    console.log("WhatsApp is ready!");
    client.isReady = true;  // IMPORTANT
  });

  client.on("authenticated", () => {
    console.log("Authenticated session saved.");
  });

  client.on("disconnected", (reason) => {
    console.log("WhatsApp disconnected:", reason);
  });

  await client.initialize();
};

// ----------------------------------------------------------
// 🔥 IMPORTANT: THIS FUNCTION MUST EXIST AND BE EXPORTED
// ----------------------------------------------------------
export const sendWhatsAppPdf = async (phone, data) => {
  if (!client || !client.isReady) {
    throw new Error("WhatsApp not ready. Try again in 2 seconds.");
  }

  // 1. Generate the styled PDF
  const pdfPath = await generateStyledPdf(data);

  // 2. Load PDF base64
  const pdfBase64 = fs.readFileSync(pdfPath).toString("base64");

  // 3. Create a WhatsApp attachment
  const media = new MessageMedia("application/pdf", pdfBase64, "MedicalReport.pdf");

  // 4. Send PDF
  await client.sendMessage(`${phone}@c.us`, media);

  return { status: "Styled PDF sent", file: pdfPath };
};
