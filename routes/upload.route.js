import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import createHttpError from "http-errors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, "..", "public", "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const router = express.Router();

router.post("/", async (req, res, next) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return next(createHttpError.BadRequest("No files were uploaded."));
    }

    // Support field name 'file', 'files', or the first file found
    const fileItem = req.files.file || req.files.files || Object.values(req.files)[0];

    const processSingleFile = async (uploadedFile) => {
      const ext = path.extname(uploadedFile.name) || "";
      const baseName = path
        .basename(uploadedFile.name, ext)
        .replace(/[^a-zA-Z0-9_-]/g, "_");
      const uniqueFileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${baseName}${ext}`;
      const savePath = path.join(uploadDir, uniqueFileName);

      await uploadedFile.mv(savePath);

      const serverUrl =
        process.env.SERVER_ENDPOINT || `${req.protocol}://${req.get("host")}`;
      const fileUrl = `${serverUrl}/uploads/${uniqueFileName}`;

      return {
        secure_url: fileUrl,
        url: fileUrl,
        public_id: uniqueFileName,
        original_filename: uploadedFile.name,
        bytes: uploadedFile.size,
        format: ext.replace(".", ""),
        resource_type: uploadedFile.mimetype.startsWith("image/")
          ? "image"
          : uploadedFile.mimetype.startsWith("video/")
          ? "video"
          : "raw",
        type: uploadedFile.mimetype,
      };
    };

    if (Array.isArray(fileItem)) {
      const results = await Promise.all(fileItem.map(processSingleFile));
      return res.status(200).json(results);
    } else {
      const result = await processSingleFile(fileItem);
      return res.status(200).json(result);
    }
  } catch (error) {
    console.error("Upload route error:", error);
    next(error);
  }
});

export default router;
