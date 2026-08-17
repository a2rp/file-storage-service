const mongoose = require("mongoose");

// Connect the application to MongoDB using the configured connection string.
const connectDatabase = async () => {
    const mongoUri =
        process.env.MONGODB_URI ||
        "mongodb://127.0.0.1:27017/file_storage_service";

    await mongoose.connect(mongoUri);

    console.log("MongoDB connected successfully.");
};

// Close the MongoDB connection during graceful shutdown.
const disconnectDatabase = async () => {
    await mongoose.connection.close();

    console.log("MongoDB connection closed.");
};

module.exports = {
    connectDatabase,
    disconnectDatabase,
};
