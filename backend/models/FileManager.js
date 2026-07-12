const mongoose = require('mongoose');

const FileManagerSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Creator
    allowedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Additional access

    message_id: {
        type: Number,
        required: true,
        unique: true
    },
    file_id: {
        type: String,
        required: true,
        unique: true
    },
    download: {
        type: Number,
        default: 0
    },
    file_unique_id: {
        type: String,
        required: true,
        unique: true
    },
    original_name: {
        type: String,
        required: true,
    },
    extension: {
        type: String,
        required: true,
    },
    file_size: {
        type: mongoose.Schema.Types.Mixed, // allows storing very large numbers
        required: true,
        default: 0
    },
    isPublic: {
        type: Boolean,
        default: false
    },
    sharedUrl: {
        type: String,
        default: null
    }

}, { timestamps: true });

FileManagerSchema.index({ userId: 1, createdAt: -1 });
FileManagerSchema.index({ allowedUsers: 1 });
FileManagerSchema.index({ message_id: 1 });

module.exports = mongoose.model('File', FileManagerSchema);
