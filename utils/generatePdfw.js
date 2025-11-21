import PDFDocument from "pdfkit";
import fs from "fs";

export const generateMedicalPdf = (message, fileName) => {
  return new Promise((resolve, reject) => {
    const pdfPath = `./reports/${fileName}.pdf`;

    const doc = new PDFDocument({ margin: 40 });
    const stream = fs.createWriteStream(pdfPath);

    doc.pipe(stream);
    doc.fontSize(14).text(message, { lineGap: 6 });
    doc.end();

    stream.on("finish", () => resolve(pdfPath));
    stream.on("error", reject);
  });
};
