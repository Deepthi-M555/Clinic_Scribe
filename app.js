import express from "express";
import cors from "cors";
import reportRoutes from "./routes/reportRoutes.js";
import { initWhatsApp } from "./services/whatsappService.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/report", reportRoutes);

app.listen(5000, () => {
  console.log("Server running on port 5000");
  initWhatsApp();
});
