const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Create tmp folder if not exists
const tempDir = path.join(__dirname, "..", "tmp");
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, tempDir);
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + "-" + file.originalname.replace(/\s+/g, "_");
    cb(null, unique);
  }
});

// FINAL FIXED FILE FILTER
const fileFilter = (req, file, cb) => {
  // Accepted audio extensions
  const allowedExt = [".mp3", ".wav", ".webm", ".m4a", ".aac", ".ogg", ".mp4"];

  // Accepted mime types
  const allowedMime = [
    "audio/mpeg",
    "audio/wav",
    "audio/webm",
    "audio/mp3",
    "audio/m4a",
    "audio/mp4",
    "application/octet-stream" // Hoppscotch + many phones use this
  ];

  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedExt.includes(ext) || allowedMime.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only audio files allowed!"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 } // 20MB max
});

module.exports = upload;
