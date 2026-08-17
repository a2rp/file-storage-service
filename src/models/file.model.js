const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema(
    {
        // Original filename received from the client.
        originalName: {
            type: String,
            required: true,
            trim: true,
            maxlength: 255,
        },

        // Unique filename used on the local filesystem.
        storedName: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },

        // MIME type reported by the upload middleware.
        mimeType: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },

        // Lowercase file extension kept separately for filtering and display.
        extension: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            index: true,
        },

        // File size in bytes.
        size: {
            type: Number,
            required: true,
            min: 0,
            index: true,
        },

        // Absolute local path used internally by the service.
        storagePath: {
            type: String,
            required: true,
        },

        // Useful flag for image-specific metadata and behavior.
        isImage: {
            type: Boolean,
            required: true,
            default: false,
            index: true,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    },
);

// Compound index supports common file listing queries.
fileSchema.index({
    mimeType: 1,
    createdAt: -1,
});

// Keep filesystem paths out of normal API serialization.
fileSchema.methods.toJSON = function () {
    const file = this.toObject();

    delete file.storagePath;

    return file;
};

const File = mongoose.model("File", fileSchema);

module.exports = File;
