const multer = require("multer");

const { MAX_FILE_SIZE, MAX_FILES } = require("../config/storage");

// Convert Multer-specific upload failures into clean API responses.
const uploadError = (error, req, res, next) => {
    if (!error) {
        return next();
    }

    // Handle Multer's built-in upload limit errors.
    if (error instanceof multer.MulterError) {
        if (error.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({
                success: false,
                message: `File is too large. Maximum allowed size is ${Math.round(
                    MAX_FILE_SIZE / (1024 * 1024),
                )} MB.`,
            });
        }

        if (error.code === "LIMIT_FILE_COUNT") {
            return res.status(400).json({
                success: false,
                message: `Too many files. Maximum allowed files per request is ${MAX_FILES}.`,
            });
        }

        if (error.code === "LIMIT_UNEXPECTED_FILE") {
            return res.status(400).json({
                success: false,
                message:
                    "Unexpected file field or too many files for the selected upload endpoint.",
            });
        }

        return res.status(400).json({
            success: false,
            message: "File upload failed.",
            code: error.code,
        });
    }

    // Handle custom upload errors such as unsupported MIME types.
    if (error.statusCode === 400 && error.message) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }

    // Forward unrelated errors to the centralized error handler.
    return next(error);
};

module.exports = uploadError;
