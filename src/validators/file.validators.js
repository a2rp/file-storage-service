const mongoose = require("mongoose");

// Validate MongoDB file document IDs before controller logic runs.
const validateFileId = (req, res, next) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid file ID.",
        });
    }

    return next();
};

// Validate file-list query parameters used for searching,
// filtering, sorting, and pagination.
const validateFileQuery = (req, res, next) => {
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

    const errors = [];

    const allowedSortFields = [
        "originalName",
        "mimeType",
        "extension",
        "size",
        "createdAt",
        "updatedAt",
    ];

    if (search !== undefined && typeof search !== "string") {
        errors.push("search must be a string.");
    }

    if (mimeType !== undefined && typeof mimeType !== "string") {
        errors.push("mimeType must be a string.");
    }

    if (extension !== undefined && typeof extension !== "string") {
        errors.push("extension must be a string.");
    }

    if (isImage !== undefined && !["true", "false"].includes(isImage)) {
        errors.push("isImage must be either true or false.");
    }

    if (!allowedSortFields.includes(sort)) {
        errors.push(`sort must be one of: ${allowedSortFields.join(", ")}.`);
    }

    if (!["asc", "desc"].includes(order)) {
        errors.push("order must be either asc or desc.");
    }

    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    if (!Number.isInteger(pageNumber) || pageNumber < 1) {
        errors.push("page must be a positive integer.");
    }

    // Limit response size so one request cannot ask for
    // an unreasonable number of metadata records.
    if (
        !Number.isInteger(limitNumber) ||
        limitNumber < 1 ||
        limitNumber > 100
    ) {
        errors.push("limit must be an integer between 1 and 100.");
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: "Invalid query parameters.",
            errors,
        });
    }

    return next();
};

module.exports = {
    validateFileId,
    validateFileQuery,
};
