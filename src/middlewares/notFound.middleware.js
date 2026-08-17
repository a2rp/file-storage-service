const notFound = (req, res) => {
    // Return a consistent response whenever no defined route matches the request.
    res.status(404).json({
        success: false,
        message: "Route not found.",
        method: req.method,
        path: req.originalUrl,
    });
};

module.exports = notFound;
