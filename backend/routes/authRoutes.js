const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateSignup, validateLogin, validateForgotPassword, validateResetPassword } = require('../middleware/validate');

router.post('/signup', validateSignup, authController.signup);
router.post('/login', validateLogin, authController.login);
router.get('/verify', authController.verifyEmail);
router.post('/forgot-password', validateForgotPassword, authController.forgotPassword);
router.post('/reset-password', validateResetPassword, authController.resetPassword);

module.exports = router;
