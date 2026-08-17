const fs = require("fs");
const path = require("path");

// Return a lowercase extension such as ".pdf" or ".png".
const getFileExtension = (filename) => {
    return path.extname(filename).toLowerCase();
};

// Identify image files using their MIME type.
const isImageFile = (mimeType) => {
    return typeof mimeType === "string" && mimeType.startsWith("image/");
};

// Check whether a physical file still exists on disk.
const fileExists = (filePath) => {
    return fs.existsSync(filePath);
};

// Remove a physical file safely if it exists.
const deletePhysicalFile = async (filePath) => {
    try {
        await fs.promises.unlink(filePath);

        return true;
    } catch (error) {
        // Missing files are treated as already removed.
        if (error.code === "ENOENT") {
            return false;
        }

        throw error;
    }
};

// Remove multiple uploaded files after a failed multi-file operation.
const cleanupUploadedFiles = async (files = []) => {
    const cleanupTasks = files
        .filter((file) => file?.path)
        .map((file) => deletePhysicalFile(file.path));

    await Promise.allSettled(cleanupTasks);
};

// Convert bytes into a readable size for API metadata.
const formatFileSize = (bytes) => {
    if (!Number.isFinite(bytes) || bytes < 0) {
        return "0 B";
    }

    if (bytes === 0) {
        return "0 B";
    }

    const units = ["B", "KB", "MB", "GB", "TB"];

    const unitIndex = Math.min(
        Math.floor(Math.log(bytes) / Math.log(1024)),
        units.length - 1,
    );

    const value = bytes / Math.pow(1024, unitIndex);

    return `${Number(value.toFixed(2))} ${units[unitIndex]}`;
};

// Build clean public metadata from a Multer file object.
const buildFileMetadata = (file) => {
    const extension = getFileExtension(file.originalname);

    return {
        originalName: file.originalname,
        storedName: file.filename,
        mimeType: file.mimetype,
        extension,
        size: file.size,
        storagePath: file.path,
        isImage: isImageFile(file.mimetype),
    };
};

module.exports = {
    buildFileMetadata,
    cleanupUploadedFiles,
    deletePhysicalFile,
    fileExists,
    formatFileSize,
    getFileExtension,
    isImageFile,
};
