import express from 'express';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Submission from '../models/Submission.js';
import crypto from 'crypto';
import { sendMail } from '../utils/mailer.js';

export const router = express.Router();

// Auth middleware for user routes
function requireAuth(req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ errors: [{ msg: 'Missing token' }] });
  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ errors: [{ msg: 'Server misconfiguration: JWT secret not set' }] });
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (!payload || !payload.user || !payload.user.id) {
      return res.status(401).json({ errors: [{ msg: 'Invalid token' }] });
    }
    req.userId = payload.user.id;
    next();
  } catch (e) {
    return res.status(401).json({ errors: [{ msg: 'Invalid token' }] });
  }
}

// @route   POST api/auth/register
// @desc    Register a user
// @access  Public
router.post(
  '/register',
  [
    body('name', 'Name is required').not().isEmpty(),
    body('email', 'Please include a valid email').isEmail(),
    body('password')
      .isString()
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$/)
      .withMessage('Password must be at least 8 characters and include uppercase, lowercase, and a special character')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      // Check if user exists
      let user = await User.findOne({ email });
      
      if (user) {
        return res.status(400).json({ errors: [{ msg: 'User already exists' }] });
      }

      // Create new user
      user = new User({
        name,
        email,
        password
      });

      // Save user to database
      await user.save();

      // Create JWT
      const payload = {
        user: {
          id: user.id
        }
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '30d' },
        (err, token) => {
          if (!process.env.JWT_SECRET) {
            return res.status(500).json({ errors: [{ msg: 'Server misconfiguration: JWT secret not set' }] });
          }
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error(err);
      if (err && err.code === 11000) {
        return res.status(400).json({ errors: [{ msg: 'Email already registered' }] });
      }
      if (err && err.name === 'ValidationError') {
        const msgs = Object.values(err.errors).map(e => ({ msg: e.message }));
        return res.status(400).json({ errors: msgs });
      }
      res.status(500).json({ errors: [{ msg: 'Server error' }] });
    }
  }
);

// @route   POST api/auth/login
// @desc    Login user and return JWT
// @access  Public
router.post(
  '/login',
  [
    body('email', 'Please include a valid email').isEmail(),
    body('password', 'Password is required').exists()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        return res.status(400).json({ errors: [{ msg: 'Invalid credentials' }] });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(400).json({ errors: [{ msg: 'Invalid credentials' }] });
      }

      if (!process.env.JWT_SECRET) {
        return res.status(500).json({ errors: [{ msg: 'Server misconfiguration: JWT secret not set' }] });
      }

      const payload = {
        user: {
          id: user.id
        }
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '30d' },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error(err);
      res.status(500).json({ errors: [{ msg: 'Server error' }] });
    }
  }
);

// @route   POST api/auth/forgot-password
// @desc    Generate password reset token
// @access  Public
router.post(
  '/forgot-password',
  [body('email', 'Please include a valid email').isEmail()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    try {
      const user = await User.findOne({ email });
      if (user) {
        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashed = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordToken = hashed;
        user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
        await user.save();

        const response = { message: 'If that email exists, a reset link has been sent' };
        // Build reset URL
        const base = (process.env.FRONTEND_BASE_URL || req.headers.origin || 'http://localhost:8080').replace(/\/$/, '');
        const resetUrl = `${base}/reset-password?token=${resetToken}`;
        // Try to send email if SMTP is configured
        try {
          const sent = await sendMail({
            to: email,
            subject: 'Reset your password',
            text: `Click the link to reset your password: ${resetUrl}`,
            html: `<p>Click the link to reset your password:</p><p><a href="${resetUrl}">${resetUrl}</a></p>`
          });
          if (sent) {
            response.email = 'sent';
          } else {
            response.email = 'not_configured';
          }
        } catch (e) {
          response.email = 'error_sending';
        }
        if (process.env.NODE_ENV !== 'production') {
          response.token = resetToken;
        }
        return res.json(response);
      }

      return res.json({ message: 'If that email exists, a reset link has been sent' });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ errors: [{ msg: 'Server error' }] });
    }
  }
);

// @route   POST api/auth/reset-password
// @desc    Reset password using token
// @access  Public
router.post(
  '/reset-password',
  [
    body('token', 'Token is required').isString().notEmpty(),
    body('password')
      .isString()
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$/)
      .withMessage('Password must be at least 8 characters and include uppercase, lowercase, and a special character')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { token, password } = req.body;
    const hashed = crypto.createHash('sha256').update(token).digest('hex');

    try {
      const user = await User.findOne({
        resetPasswordToken: hashed,
        resetPasswordExpires: { $gt: new Date() }
      }).select('+password');

      if (!user) {
        return res.status(400).json({ errors: [{ msg: 'Invalid or expired token' }] });
      }

      user.password = password;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      return res.json({ message: 'Password has been reset' });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ errors: [{ msg: 'Server error' }] });
    }
  }
);

export default router;

// Get current user's profile
router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('name email createdAt');
    if (!user) return res.status(404).json({ errors: [{ msg: 'User not found' }] });
    res.json({ id: String(user._id), name: user.name, email: user.email, createdAt: user.createdAt });
  } catch (err) {
    res.status(500).json({ errors: [{ msg: 'Server error' }] });
  }
});

// Delete current user's profile and their submissions
router.delete('/me', requireAuth, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.userId);
    if (!user) return res.status(404).json({ errors: [{ msg: 'User not found' }] });
    await Submission.deleteMany({ userId: req.userId });
    res.json({ message: 'Account deleted' });
  } catch (err) {
    res.status(500).json({ errors: [{ msg: 'Server error' }] });
  }
});
