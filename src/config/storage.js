const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const multer = require("multer");

const UPLOAD_DIRECTORY = path.join(process.cwd(), "uploads");

const MAX_FILE_SIZE = Number(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024;

const MAX_FILES = Number(process.env.MAX_FILES) || 5;

const allowedMimeTypes = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf",
    "text/plain",
    "application/zip",
]);

// Make sure the upload directory exists before Multer writes files.
if (!fs.existsSync(UPLOAD_DIRECTORY)) {
    fs.mkdirSync(UPLOAD_DIRECTORY, {
        recursive: true,
    });
}

// Generate a safe unique filename while preserving the original extension.
const createStoredFilename = (originalName) => {
    const extension = path.extname(originalName).toLowerCase();

    const randomPart = crypto.randomBytes(12).toString("hex");

    return `${Date.now()}-${randomPart}${extension}`;
};

// Store uploaded files on the local filesystem.
const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, UPLOAD_DIRECTORY);
    },

    filename: (req, file, callback) => {
        callback(null, createStoredFilename(file.originalname));
    },
});

// Reject unsupported file types before writing them.
const fileFilter = (req, file, callback) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
        const error = new Error("Unsupported file type.");

        error.statusCode = 400;

        return callback(error, false);
    }

    return callback(null, true);
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: MAX_FILE_SIZE,
        files: MAX_FILES,
    },
});

module.exports = {
    MAX_FILE_SIZE,
    MAX_FILES,
    UPLOAD_DIRECTORY,
    allowedMimeTypes,
    upload,
};
