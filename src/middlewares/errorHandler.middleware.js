const errorHandler = (error, req, res, next) => {
    console.error(error);

    if (res.headersSent) {
        return next(error);
    }

    // Handle invalid MongoDB ObjectId values that reach Mongoose.
    if (error.name === "CastError" && error.kind === "ObjectId") {
        return res.status(400).json({
            success: false,
            message: "Invalid resource ID.",
            method: req.method,
            path: req.path,
        });
    }

    // Handle Mongoose schema validation failures.
    if (error.name === "ValidationError") {
        const errors = Object.values(error.errors).map((item) => item.message);

        return res.status(400).json({
            success: false,
            message: "Database validation failed.",
            errors,
            method: req.method,
            path: req.path,
        });
    }

    // Handle MongoDB duplicate-key errors.
    if (error.code === 11000) {
        return res.status(409).json({
            success: false,
            message: "A file record with the same unique value already exists.",
            method: req.method,
            path: req.path,
        });
    }

    // Handle filesystem permission or access failures.
    if (error.code === "EACCES" || error.code === "EPERM") {
        return res.status(500).json({
            success: false,
            message: "File storage permission error.",
            method: req.method,
            path: req.path,
        });
    }

    // Handle missing physical files when a lower-level filesystem call throws.
    if (error.code === "ENOENT") {
        return res.status(404).json({
            success: false,
            message: "Physical file not found on storage.",
            method: req.method,
            path: req.path,
        });
    }

    // Use an intentional status code when one has been assigned.
    const statusCode =
        Number.isInteger(error.statusCode) &&
        error.statusCode >= 400 &&
        error.statusCode < 600
            ? error.statusCode
            : 500;

    const message =
        statusCode < 500 && typeof error.message === "string" && error.message.trim()
            ? error.message
            : "Internal server error.";

    return res.status(statusCode).json({
        success: false,
        message,
        method: req.method,
        path: req.path,
    });
};

module.exports = errorHandler;
