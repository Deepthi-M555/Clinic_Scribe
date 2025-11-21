require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB= require('./config/db');
const path = require("path");
// `reportRoutes.js` may use ESM `export default` — support both CJS and ESM default
let reportRoutes = require("./routes/reportRoutes.js");
if (reportRoutes && reportRoutes.default) reportRoutes = reportRoutes.default;
const { initWhatsApp } =require("./services/whatsappService.js");
const authRoutes = require('./routes/auth');
const audioRoutes = require("./routes/audioRoute");
const noteRoutes = require("./routes/noteRoute");
const app = express();

// middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// connect DB
connectDB(process.env.MONGODB_URI);

// routes
app.use('/auth', authRoutes);

// health
app.get('/ping', (req, res) => res.json({ ok: true, message: 'pong' }));

const PORT = process.env.PORT || 8080;


app.use("/audio", audioRoutes);
app.use("/notes", noteRoutes);
app.use("/patients", require("./routes/patientRoute"));
app.use("/pdf", require("./routes/pdfRoute"));
app.use("/pdfs", express.static(path.join(__dirname, "pdfs")));
app.use("/api/report", reportRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  // initWhatsApp();
});