const express = require("express");

const {
    deleteFile,
    downloadFile,
    getFileById,
    getFiles,
    uploadMultipleFiles,
    uploadSingleFile,
    viewFile,
} = require("../controllers/file.controllers");

const { upload } = require("../config/storage");

const {
    validateFileId,
    validateFileQuery,
} = require("../validators/file.validators");

const router = express.Router();

// List file metadata with search, filters, sorting, and pagination.
router.get("/", validateFileQuery, getFiles);

// Fetch one file metadata record by MongoDB ID.
router.get("/:id", validateFileId, getFileById);

// Upload one file using multipart/form-data.
// The expected field name is "file".
router.post("/upload", upload.single("file"), uploadSingleFile);

// Upload multiple files using multipart/form-data.
// The expected field name is "files".
router.post("/upload/multiple", upload.array("files"), uploadMultipleFiles);

// Download a file using its original filename.
router.get("/:id/download", validateFileId, downloadFile);

// Stream a file inline when the client supports its MIME type.
router.get("/:id/view", validateFileId, viewFile);

// Delete both the physical file and its MongoDB metadata record.
router.delete("/:id", validateFileId, deleteFile);

module.exports = router;
