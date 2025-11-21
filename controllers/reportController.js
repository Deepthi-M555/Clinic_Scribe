import { sendWhatsAppPdf } from "../services/whatsappService.js";

export const generateReport = async (req, res) => {
  try {
    const phone = req.body.phone;

    const result = await sendWhatsAppPdf(phone, req.body);

    res.status(200).json({
      message: "Styled PDF sent successfully!",
      result
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
