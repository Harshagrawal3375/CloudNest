const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');

const generateToken = () => crypto.randomBytes(32).toString('hex');

const getPasswordResetEmail = (name, url) => `
  <h2>Password Reset Request</h2>
  <p>Hi ${name},</p>
  <p>You requested a password reset. Click the link below to set a new password:</p>
  <p><a href="${url}">${url}</a></p>
  <p>This link expires in 1 hour.</p>
  <p>If you didn't request this, ignore this email.</p>
`;

const getVerificationEmail = (name, url) => `
  <h2>Verify Your Email</h2>
  <p>Hi ${name},</p>
  <p>Thanks for signing up! Click below to verify your email:</p>
  <p><a href="${url}">${url}</a></p>
  <p>This link expires in 24 hours.</p>
`;

const sendEmail = async (to, subject, html) => {
    if (!process.env.SMTP_HOST) {
        console.log(`[EMAIL STUB] To: ${to} | Subject: ${subject}`);
        return true;
    }
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });
    await transporter.sendMail({ from: process.env.SMTP_FROM || 'CloudNest <noreply@cloudnest.app>', to, subject, html });
};

exports.signup = async (req, res) => {
    try {
        const { email, password, name } = req.body || {};
        if (!email || !password || !name) {
            return res.status(400).json({ msg: 'Missing required fields: email, password, name' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        const verificationToken = generateToken();
        const user = new User({
            email,
            password: hashedPassword,
            name,
            verificationToken,
            verificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000)
        });
        await user.save();

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const verifyUrl = `${frontendUrl}/auth/verify?token=${verificationToken}`;
        await sendEmail(email, 'Verify your CloudNest account', getVerificationEmail(name, verifyUrl));

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
        res.status(201).json({ msg: 'User created successfully', token });
    } catch (error) {
        console.log(error);
        if (error.code === 11000) {
            return res.status(400).json({ msg: 'Email already in use' });
        }
        res.status(500).json({ msg: 'Error creating user' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body || {};
        if (!email || !password) return res.status(400).json({ msg: 'Email and password are required' });

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
        res.status(200).json({ msg: 'success', token });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ msg: 'Error logging in' });
    }
};

exports.verifyEmail = async (req, res) => {
    try {
        const { token } = req.query;
        if (!token) return res.status(400).json({ error: 'Token required' });

        const user = await User.findOne({
            verificationToken: token,
            verificationExpires: { $gt: new Date() }
        });
        if (!user) return res.status(400).json({ error: 'Invalid or expired token' });

        user.isVerified = true;
        user.verificationToken = null;
        user.verificationExpires = null;
        await user.save();

        res.status(200).json({ msg: 'Email verified successfully' });
    } catch (error) {
        console.error('Verify error:', error);
        res.status(500).json({ error: 'Verification failed' });
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: 'Email is required' });

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(200).json({ msg: 'If an account exists, a reset link has been sent' });
        }

        const resetToken = generateToken();
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);
        await user.save();

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const resetUrl = `${frontendUrl}/auth/reset-password?token=${resetToken}`;
        await sendEmail(email, 'Reset your CloudNest password', getPasswordResetEmail(user.name, resetUrl));

        res.status(200).json({ msg: 'If an account exists, a reset link has been sent' });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ error: 'Something went wrong' });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;
        if (!token || !password) return res.status(400).json({ error: 'Token and password required' });

        if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: new Date() }
        });
        if (!user) return res.status(400).json({ error: 'Invalid or expired token' });

        user.password = await bcrypt.hash(password, 10);
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        await user.save();

        res.status(200).json({ msg: 'Password reset successful' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ error: 'Something went wrong' });
    }
};
