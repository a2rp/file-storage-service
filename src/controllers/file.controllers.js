const path = require("path");
const fs = require("fs");

const File = require("../models/file.model");

const {
    buildFileMetadata,
    cleanupUploadedFiles,
    deletePhysicalFile,
    fileExists,
    formatFileSize,
} = require("../utils/file.utils");

// Upload one file and persist its metadata in MongoDB.
const uploadSingleFile = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "A file is required.",
            });
        }

        const metadata = buildFileMetadata(req.file);

        try {
            const file = await File.create(metadata);

            return res.status(201).json({
                success: true,
                message: "File uploaded successfully.",
                data: {
                    file: {
                        ...file.toJSON(),
                        readableSize: formatFileSize(file.size),
                    },
                },
            });
        } catch (error) {
            // If MongoDB persistence fails, remove the already uploaded file.
            await deletePhysicalFile(req.file.path);

            throw error;
        }
    } catch (error) {
        return next(error);
    }
};

// Upload multiple files and persist all metadata records.
const uploadMultipleFiles = async (req, res, next) => {
    const uploadedFiles = Array.isArray(req.files) ? req.files : [];

    try {
        if (uploadedFiles.length === 0) {
            return res.status(400).json({
                success: false,
                message: "At least one file is required.",
            });
        }

        const metadata = uploadedFiles.map(buildFileMetadata);

        try {
            const files = await File.insertMany(metadata);

            return res.status(201).json({
                success: true,
                message: "Files uploaded successfully.",
                data: {
                    count: files.length,
                    files: files.map((file) => ({
                        ...file.toJSON(),
                        readableSize: formatFileSize(file.size),
                    })),
                },
            });
        } catch (error) {
            // Avoid orphaned files when MongoDB insertion fails.
            await cleanupUploadedFiles(uploadedFiles);

            throw error;
        }
    } catch (error) {
        return next(error);
    }
};

// List stored file metadata with search, filters, sorting, and pagination.
const getFiles = async (req, res, next) => {
    try {
        const {
            search,
            mimeType,
            extension,
            isImage,
            sort = "createdAt",
            order = "desc",
            page = "1",
            limit = "10",
        } = req.query;

        const filter = {};

        if (search) {
            filter.originalName = {
                $regex: search.trim(),
                $options: "i",
            };
        }

        if (mimeType) {
            filter.mimeType = {
                $regex: `^${mimeType.trim()}$`,
                $options: "i",
            };
        }

        if (extension) {
            const normalizedExtension = extension.startsWith(".")
                ? extension.toLowerCase()
                : `.${extension.toLowerCase()}`;

            filter.extension = normalizedExtension;
        }

        if (isImage !== undefined) {
            filter.isImage = isImage === "true";
        }

        const sortMap = {
            originalName: "originalName",
            mimeType: "mimeType",
            extension: "extension",
            size: "size",
            createdAt: "createdAt",
            updatedAt: "updatedAt",
        };

        const sortField = sortMap[sort] || "createdAt";

        const sortDirection = order === "asc" ? 1 : -1;

        const currentPage = Number(page);
        const pageLimit = Number(limit);
        const skip = (currentPage - 1) * pageLimit;

        const totalItems = await File.countDocuments(filter);

        const files = await File.find(filter)
            .sort({
                [sortField]: sortDirection,
            })
            .skip(skip)
            .limit(pageLimit);

        const totalPages =
            totalItems === 0 ? 0 : Math.ceil(totalItems / pageLimit);

        return res.status(200).json({
            success: true,
            message: "Files fetched successfully.",
            data: files.map((file) => ({
                ...file.toJSON(),
                readableSize: formatFileSize(file.size),
            })),
            pagination: {
                page: currentPage,
                limit: pageLimit,
                totalItems,
                totalPages,
            },
        });
    } catch (error) {
        return next(error);
    }
};

// Fetch one file metadata record by MongoDB ID.
const getFileById = async (req, res, next) => {
    try {
        const file = await File.findById(req.params.id);

        if (!file) {
            return res.status(404).json({
                success: false,
                message: "File record not found.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "File metadata fetched successfully.",
            data: {
                file: {
                    ...file.toJSON(),
                    readableSize: formatFileSize(file.size),
                },
            },
        });
    } catch (error) {
        return next(error);
    }
};

// Download the physical file using its original client filename.
const downloadFile = async (req, res, next) => {
    try {
        const file = await File.findById(req.params.id);

        if (!file) {
            return res.status(404).json({
                success: false,
                message: "File record not found.",
            });
        }

        if (!fileExists(file.storagePath)) {
            return res.status(404).json({
                success: false,
                message: "Physical file not found on storage.",
            });
        }

        return res.download(file.storagePath, file.originalName, (error) => {
            if (error && !res.headersSent) {
                return next(error);
            }
        });
    } catch (error) {
        return next(error);
    }
};

// Stream a file inline when the client/browser supports its MIME type.
const viewFile = async (req, res, next) => {
    try {
        const file = await File.findById(req.params.id);

        if (!file) {
            return res.status(404).json({
                success: false,
                message: "File record not found.",
            });
        }

        if (!fileExists(file.storagePath)) {
            return res.status(404).json({
                success: false,
                message: "Physical file not found on storage.",
            });
        }

        const fileStats = await fs.promises.stat(file.storagePath);

        res.setHeader("Content-Type", file.mimeType);

        res.setHeader("Content-Length", fileStats.size);

        res.setHeader(
            "Content-Disposition",
            `inline; filename="${path.basename(file.originalName)}"`,
        );

        const stream = fs.createReadStream(file.storagePath);

        stream.on("error", next);

        return stream.pipe(res);
    } catch (error) {
        return next(error);
    }
};

// Delete both the physical file and its MongoDB metadata record.
const deleteFile = async (req, res, next) => {
    try {
        const file = await File.findById(req.params.id);

        if (!file) {
            return res.status(404).json({
                success: false,
                message: "File record not found.",
            });
        }

        const physicalFileRemoved = await deletePhysicalFile(file.storagePath);

        await File.deleteOne({
            _id: file._id,
        });

        return res.status(200).json({
            success: true,
            message: "File deleted successfully.",
            data: {
                id: file._id,
                originalName: file.originalName,
                physicalFileRemoved,
            },
        });
    } catch (error) {
        return next(error);
    }
};

module.exports = {
    deleteFile,
    downloadFile,
    getFileById,
    getFiles,
    uploadMultipleFiles,
    uploadSingleFile,
    viewFile,
};
