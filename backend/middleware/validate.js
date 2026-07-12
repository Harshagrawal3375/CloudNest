const { body, param, validationResult } = require('express-validator');

const handleValidation = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Validation failed', details: errors.array().map(e => e.msg) });
    }
    next();
};

const validateSignup = [
    body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
    handleValidation
];

const validateLogin = [
    body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
    handleValidation
];

const validateForgotPassword = [
    body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
    handleValidation
];

const validateResetPassword = [
    body('token').notEmpty().withMessage('Token is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    handleValidation
];

const validateShare = [
    param('id').isMongoId().withMessage('Invalid file ID'),
    body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
    handleValidation
];

const validateMessageId = [
    param('messageId').isNumeric().withMessage('Invalid message ID'),
    handleValidation
];

const validateFileId = [
    param('id').isMongoId().withMessage('Invalid file ID'),
    handleValidation
];

module.exports = {
    validateSignup,
    validateLogin,
    validateForgotPassword,
    validateResetPassword,
    validateShare,
    validateMessageId,
    validateFileId
};
