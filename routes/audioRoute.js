const express = require("express");
const router = express.Router();

const upload = require("../config/multerConfig");
const auth = require("../middleware/auth");

const {
  uploadAudio,
  transcribe
} = require("../controllers/audioController");

// POST /audio/upload
router.post("/upload", auth, upload.single("file"), uploadAudio);

// POST /audio/transcribe
router.post("/transcribe", auth, transcribe);

module.exports = router;
