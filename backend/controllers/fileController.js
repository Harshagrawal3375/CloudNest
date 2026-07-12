const axios = require('axios');
const fs = require("fs-extra");
const path = require("path");
const multer = require("multer");
const File = require("../models/FileManager");
const User = require("../models/User");

const upload = multer({
    storage: multer.diskStorage({
        destination: './uploads/',
        filename: (req, file, cb) => {
            cb(null, Date.now() + '-' + file.originalname);
        }
    }),
    limits: { fileSize: 50 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const blocked = ['.exe', '.bat', '.cmd', '.sh', '.ps1', '.msi'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (blocked.includes(ext)) {
            return cb(new Error('File type not allowed'));
        }
        cb(null, true);
    }
}).single('file');

exports.uploadFile = async (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ error: 'File upload error', details: err.message });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const filePath = req.file.path;
        try {
            const sentMsg = await bot.sendDocument(process.env.CHANNEL_USERNAME, filePath);
            const doc = sentMsg.document;

            await fs.remove(filePath);

            const userId = req.user.id || req.user._id;

            const fileStorage = new File({
                userId: userId,
                message_id: sentMsg.message_id,
                file_id: doc.file_id,
                file_unique_id: doc.file_unique_id,
                original_name: doc.file_name,
                extension: path.extname(doc.file_name),
                file_size: doc.file_size,
                download: 0
            });

            await fileStorage.save();

            res.status(200).json({
                message: 'File uploaded',
                message_id: sentMsg.message_id
            });

        } catch (err) {
            console.error('Upload error:', err);
            await fs.remove(filePath).catch(() => {});
            res.status(500).json({
                error: 'Upload failed',
                details: process.env.NODE_ENV === 'development' ? err.message : undefined
            });
        }
    });
};

exports.downloadFile = async (req, res) => {
    try {
        const { messageId } = req.params;
        const userId = req.user.id || req.user._id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const entry = await File.findOne({
            message_id: messageId,
            $or: [
                { userId: userId },
                { allowedUsers: userId }
            ]
        }).lean();

        if (!entry) {
            return res.status(404).json({ error: 'File not found or access denied' });
        }

        const isOwner = entry.userId && entry.userId.toString() === userId.toString();
        const allowedUsers = (entry.allowedUsers || []).map(a => a.toString());
        const isShared = allowedUsers.includes(userId.toString());

        if (!isOwner && !isShared) {
            return res.status(403).json({ error: 'Access denied' });
        }

        await File.updateOne({ _id: entry._id }, { $inc: { download: 1 } });

        const file = await bot.getFile(entry.file_id);
        if (!file || !file.file_path) {
            return res.status(500).json({ error: 'Could not fetch file from Telegram' });
        }

        const fileUrl = `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${file.file_path}`;
        const fileName = entry.file_unique_id + entry.extension;
        const filePath = path.join(process.cwd(), 'downloads', fileName);

        await fs.ensureDir(path.dirname(filePath));

        const response = await axios({
            url: fileUrl,
            method: 'GET',
            responseType: 'stream',
        });

        const writer = fs.createWriteStream(filePath);
        response.data.pipe(writer);

        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });

        const fileBuffer = await fs.readFile(filePath);
        await fs.unlink(filePath);

        res.set({
            'Content-Type': 'application/octet-stream',
            'Content-Disposition': `attachment; filename="${entry.original_name}"`,
        });

        res.status(200).send(fileBuffer);
    } catch (err) {
        console.error('Download error:', err);
        const fileName = req.params.messageId;
        const tempPath = path.join(process.cwd(), 'downloads', fileName);
        await fs.remove(tempPath).catch(() => {});
        res.status(500).json({ error: 'Download failed' });
    }
};

exports.myFiles = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
        const skip = (page - 1) * limit;

        const query = {
            $or: [
                { userId },
                { allowedUsers: userId }
            ]
        };

        const [files, totalCount] = await Promise.all([
            File.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
            File.countDocuments(query)
        ]);

        const getFileSize = (size) => {
            if (typeof size === 'object' && size !== null && size.low !== undefined && size.high !== undefined) {
                return BigInt(size.low) + (BigInt(size.high) << 32n);
            }
            return BigInt(size || 0);
        };
        const totalStorage = files.reduce((sum, file) => {
            return sum + getFileSize(file.file_size);
        }, 0n);

        const allFiles = await File.find(query).lean();
        const grandTotal = allFiles.reduce((sum, file) => sum + getFileSize(file.file_size), 0n);

        const formatStorage = (bytesBigInt) => {
            const k = 1024n;
            const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
            let bytes = bytesBigInt;
            if (bytes === 0n) return '0 Bytes';
            let i = 0;
            while (bytes >= k && i < sizes.length - 1) {
                bytes = bytes / k;
                i++;
            }
            if (bytes <= BigInt(Number.MAX_SAFE_INTEGER)) {
                return `${Number(bytes).toFixed(2)} ${sizes[i]}`;
            }
            return `${bytes.toString()} ${sizes[i]}`;
        };

        res.status(200).json({
            data: files,
            pagination: {
                page,
                limit,
                totalCount,
                totalPages: Math.ceil(totalCount / limit)
            },
            stats: {
                totalFiles: totalCount,
                totalStorage: grandTotal.toString(),
                readableStorage: formatStorage(grandTotal),
                averageFileSize: totalCount > 0 ? formatStorage(grandTotal / BigInt(totalCount)) : '0 Bytes'
            }
        });

    } catch (err) {
        console.error('Error in myFiles:', err);
        res.status(500).json({ error: 'Failed to fetch files' });
    }
};

exports.shareFile = async (req, res) => {
    try {
        const { id } = req.params;
        const { email } = req.body;
        const userId = req.user.id || req.user._id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        if (email === user.email) {
            return res.status(400).json({ error: "You can't share with yourself" });
        }

        const targetUser = await User.findOne({ email });
        if (!targetUser) {
            return res.status(404).json({ error: 'Email not found' });
        }

        const file = await File.findOne({ userId, _id: id });
        if (!file) {
            return res.status(404).json({ error: 'File not found or Access denied' });
        }

        if (file.allowedUsers.includes(targetUser._id)) {
            file.allowedUsers.pull(targetUser._id);
        } else {
            file.allowedUsers.push(targetUser._id);
        }
        await file.save();

        res.status(200).json({
            message: file.allowedUsers.includes(targetUser._id) ? 'File shared' : 'Access revoked'
        });
    } catch (err) {
        console.error('Share error:', err);
        res.status(500).json({ error: 'Share failed' });
    }
};

exports.deleteFile = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id || req.user._id;

        const file = await File.findOne({ userId, _id: id });
        if (!file) {
            return res.status(404).json({ error: 'File not found or access denied' });
        }

        try {
            await bot.deleteMessage(process.env.CHANNEL_USERNAME, file.message_id);
        } catch (telegramErr) {
            console.error('Telegram deletion error:', telegramErr);
        }

        await File.deleteOne({ _id: id, userId });

        res.status(200).json({ message: 'File deleted successfully' });
    } catch (err) {
        console.error('Delete error:', err);
        res.status(500).json({ error: 'Delete failed' });
    }
};
