const generatePDF = require("../utils/generatePDF");

exports.generateNotePDF = async (req, res) => {
  try {
    const note = req.body;

    if (!note || typeof note !== "object") {
      return res.status(400).json({
        ok: false,
        error: "Invalid request body. JSON expected."
      });
    }

    const pdfUrl = await generatePDF(note);

    return res.json({
      ok: true,
      pdfUrl
    });

  } catch (err) {
    console.log("Generate PDF error:", err);
    res.status(500).json({
      ok: false,
      error: "Failed to generate PDF"
    });
  }
};
