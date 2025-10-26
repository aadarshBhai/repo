import express from 'express';
import jwt from 'jsonwebtoken';
import Submission from '../models/Submission.js';
import User from '../models/User.js';

const router = express.Router();

// Admin login using env credentials
router.post('/login', (req, res) => {
  const { email, password } = req.body || {};
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    return res.status(500).json({ errors: [{ msg: 'Server misconfiguration: admin credentials not set' }] });
  }

  if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ errors: [{ msg: 'Invalid admin credentials' }] });
  }

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ errors: [{ msg: 'Server misconfiguration: JWT secret not set' }] });
  }

  const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '30d' });
  res.json({ token });
});

// Admin auth middleware
function requireAdmin(req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ errors: [{ msg: 'Missing token' }] });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.role !== 'admin') return res.status(403).json({ errors: [{ msg: 'Forbidden' }] });
    req.admin = true;
    next();
  } catch (e) {
    return res.status(401).json({ errors: [{ msg: 'Invalid token' }] });
  }
}

// List submissions by status (default: pending)
router.get('/submissions', requireAdmin, async (req, res) => {
  try {
    const status = req.query.status || 'pending';
    const items = await Submission.find({ status }).sort({ createdAt: -1 });
    res.json(items);
  } catch (e) {
    res.status(500).json({ errors: [{ msg: 'Server error' }] });
  }
});

// Get a single submission by id (includes consent)
router.get('/submissions/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await Submission.findById(id);
    if (!doc) return res.status(404).json({ errors: [{ msg: 'Not found' }] });
    res.json(doc);
  } catch (e) {
    res.status(500).json({ errors: [{ msg: 'Server error' }] });
  }
});

// Approve a submission
router.patch('/submissions/:id/approve', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await Submission.findByIdAndUpdate(id, { status: 'approved' }, { new: true });
    if (!doc) return res.status(404).json({ errors: [{ msg: 'Not found' }] });
    res.json(doc);
  } catch (e) {
    res.status(500).json({ errors: [{ msg: 'Server error' }] });
  }
});

// Reject a submission
router.patch('/submissions/:id/reject', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await Submission.findByIdAndUpdate(id, { status: 'rejected' }, { new: true });
    if (!doc) return res.status(404).json({ errors: [{ msg: 'Not found' }] });
    res.json(doc);
  } catch (e) {
    res.status(500).json({ errors: [{ msg: 'Server error' }] });
  }
});

// Delete a submission (any status)
router.delete('/submissions/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await Submission.findByIdAndDelete(id);
    if (!doc) return res.status(404).json({ errors: [{ msg: 'Not found' }] });
    res.json({ message: 'Deleted' });
  } catch (e) {
    res.status(500).json({ errors: [{ msg: 'Server error' }] });
  }
});

// List users (basic fields)
router.get('/users', requireAdmin, async (req, res) => {
  try {
    const users = await User.find({}, 'name email createdAt');
    res.json(users);
  } catch (e) {
    res.status(500).json({ errors: [{ msg: 'Server error' }] });
  }
});

// Delete a user and their submissions
router.delete('/users/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ errors: [{ msg: 'User not found' }] });
    await Submission.deleteMany({ userId: id });
    res.json({ message: 'User deleted' });
  } catch (e) {
    res.status(500).json({ errors: [{ msg: 'Server error' }] });
  }
});

export default router;

