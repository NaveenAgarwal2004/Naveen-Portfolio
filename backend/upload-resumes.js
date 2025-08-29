// upload-resumes.js
require("dotenv").config();
const { v2: cloudinary } = require("cloudinary");
const path = require("path");

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Files to handle
const files = [
  {
    file: path.resolve(__dirname, "Naveen Agarwal - Frontend.pdf"),
    public_id: "naveen-agarwal-frontend"
  },
  {
    file: path.resolve(__dirname, "NaveenAgarwal_Backend.pdf"),
    public_id: "naveen-agarwal-backend"
  },
  {
    file: path.resolve(__dirname, "NaveenAgarwal__Resume.pdf"),
    public_id: "naveen-agarwal-resume"
  }
];

(async () => {
  try {
    for (const f of files) {
      console.log(`🔍 Checking for old version: ${f.public_id}`);

      // Try deleting old "image" version if exists
      try {
        await cloudinary.uploader.destroy(`portfolio/resumes/${f.public_id}`, {
          resource_type: "image",
          invalidate: true
        });
        console.log(`🗑 Deleted old image version of ${f.public_id}`);
      } catch (err) {
        console.log(`⚠ No old image version found for ${f.public_id}`);
      }

      // Upload new "raw" version
      console.log(`⬆ Uploading new raw version: ${f.file}`);
      const res = await cloudinary.uploader.upload(f.file, {
        resource_type: "raw",
        folder: "portfolio/resumes",
        public_id: f.public_id,
        overwrite: true
      });
      console.log(`✅ Uploaded: ${res.secure_url}\n`);
    }

    console.log("🎉 All files processed successfully!");
  } catch (err) {
    console.error("❌ Error:", err);
  }
})();
