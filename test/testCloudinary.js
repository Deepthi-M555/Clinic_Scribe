require("dotenv").config();
const { uploadPdfToCloudinary } = require("../src/utils/cloudUpload");

(async () => {
  try {
    const url = await uploadPdfToCloudinary("./sample.pdf");
    console.log("Uploaded to Cloudinary:", url);
  } catch (err) {
    console.error("Cloudinary Upload Error:", err);
  }
})();
