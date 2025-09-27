// src/middlewares/multer.js
import multer from "multer";

const memoryStorage = multer.memoryStorage();

export const uploadChatFile = multer({ storage: memoryStorage });
export const uploadProfile = multer({ storage: memoryStorage });

const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/jpg",
        "audio/mpeg",
        "audio/mp4",
        "audio/webm", // Common for voice recordings
    ];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Invalid file type."), false);
    }
};