const express = require("express");

const fileRoutes = require("./routes/file.routes");

const uploadError = require("./middlewares/uploadError.middleware");
const notFound = require("./middlewares/notFound.middleware");
const errorHandler = require("./middlewares/errorHandler.middleware");

const app = express();

// Hide the default ExpressJS identification header.
app.disable("x-powered-by");

// Parse JSON request bodies for non-file endpoints.
app.use(express.json());

// Root endpoint confirms that the service is available.
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "File Storage Service is running.",
        version: "v1",
    });
});

// Health endpoint provides lightweight runtime information.
app.get("/api/v1/health", (req, res) => {
    res.status(200).json({
        success: true,
        status: "healthy",
        service: "file-storage-service",
        version: "1.0.0",
        uptime: Number(process.uptime().toFixed(2)),
        timestamp: new Date().toISOString(),
    });
});

// All file upload, metadata, download, view, and delete routes.
app.use("/api/v1/files", fileRoutes);

// Convert Multer upload failures into clean API responses.
app.use(uploadError);

// Handle routes that do not exist.
app.use(notFound);

// Keep centralized error handling as the final middleware.
app.use(errorHandler);

module.exports = app;
