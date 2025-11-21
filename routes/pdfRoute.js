const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

const { generateNotePDF } = require("../controllers/pdfController");

// POST → Generate PDF for a GPT note
router.post("/generate", auth, generateNotePDF);

module.exports = router;
