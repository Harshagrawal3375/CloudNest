const express = require('express');
const router = express.Router();
const { uploadFile, downloadFile, myFiles, shareFile, deleteFile } = require('../controllers/fileController');
const auth = require('../middleware/auth');
const { validateShare, validateMessageId, validateFileId } = require('../middleware/validate');

router.post('/upload', auth, uploadFile);
router.get('/download/:messageId', auth, validateMessageId, downloadFile);
router.get('/my-files', auth, myFiles);
router.post('/share/:id', auth, validateShare, shareFile);
router.delete('/:id', auth, validateFileId, deleteFile);

module.exports = router;
