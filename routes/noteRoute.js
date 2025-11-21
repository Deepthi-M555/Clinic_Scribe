const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

const { generateNote } = require("../controllers/noteController");


router.post("/generate", auth, generateNote);

module.exports = router;
