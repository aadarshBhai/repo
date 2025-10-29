import express from 'express';
import { body, validationResult } from 'express-validator';
import Submission from '../models/Submission.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// List the authenticated user's own submissions (all statuses)
router.get('/mine', requireAuth, async (req, res) => {
  try {
    const items = await Submission.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(items);
  } catch (e) {
    res.status(500).json({ errors: [{ msg: 'Server error' }] });
  }
});

// Require user auth via JWT for creating submissions
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

router.post(
  '/',
  requireAuth,
  [
    body('title').isString().trim().notEmpty(),
    body('description').isString().trim().notEmpty(),
    body('category').isString().trim().notEmpty(),
    body('type').optional().isIn(['text', 'audio', 'video', 'image']),
    body('contentUrl').optional().isString().trim(),
    body('text').optional().isString().trim(),
    body('tribe').optional().isString().trim(),
    body('country').optional().isString().trim(),
    body('state').optional().isString().trim(),
    body('village').optional().isString().trim(),
    body('consent.given').isBoolean(),
    body('consent.name').isString().trim().notEmpty(),
    body('consent.relation').optional().isString().trim(),
    body('consent.fileUrl').optional().isString().trim(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { title, description, category, type, contentUrl, text, tribe, country, state, village, consent } = req.body;
      const payload = { title, description, category, status: 'pending' };
      if (req.userId) payload.userId = req.userId;
      if (type) payload.type = type;
      if (contentUrl) payload.contentUrl = contentUrl;
      if (text) payload.text = text;
      if (tribe) payload.tribe = String(tribe).toLowerCase();
      if (country) payload.country = country;
      if (state) payload.state = state;
      if (village) payload.village = village;
      if (consent) payload.consent = consent;
      const doc = await Submission.create(payload);
      res.status(201).json(doc);
    } catch (e) {
      res.status(500).json({ errors: [{ msg: 'Server error' }] });
    }
  }
);

router.get('/', async (req, res) => {
  try {
    const filter = {};
    const status = req.query.status;
    // Default visibility: only approved to the public
    if (!status) {
      filter.status = 'approved';
    } else if (String(status).toLowerCase() !== 'all') {
      // Allow explicit filtering to a single status (e.g., pending/rejected)
      filter.status = status;
    }
    if (req.query.category) filter.category = req.query.category;
    if (req.query.tribe) filter.tribe = String(req.query.tribe).toLowerCase();
    if (req.query.country) filter.country = req.query.country;
    if (req.query.state) filter.state = req.query.state;
    if (req.query.village) filter.village = req.query.village;
    const items = await Submission.find(filter).sort({ createdAt: -1 });
    res.json(items);
  } catch (e) {
    res.status(500).json({ errors: [{ msg: 'Server error' }] });
  }
});

// Distinct tribes available for filters
router.get('/tribes', async (req, res) => {
  try {
    const filter = {};
    if (req.query.country) filter.country = req.query.country;
    if (req.query.state) filter.state = req.query.state;
    // Consider only approved for public listing
    filter.status = 'approved';
    const tribes = await Submission.distinct('tribe', filter);
    const cleaned = tribes.filter(Boolean).map((t) => String(t));
    res.json(cleaned);
  } catch (e) {
    res.status(500).json({ errors: [{ msg: 'Server error' }] });
  }
});

// Distinct villages available for a given tribe (and optional country/state)
router.get('/villages', async (req, res) => {
  try {
    const filter = {};
    if (req.query.tribe) filter.tribe = String(req.query.tribe).toLowerCase();
    if (req.query.country) filter.country = req.query.country;
    if (req.query.state) filter.state = req.query.state;
    filter.status = 'approved';
    const villages = await Submission.distinct('village', filter);
    const cleaned = villages.filter(Boolean).map((v) => String(v));
    res.json(cleaned);
  } catch (e) {
    res.status(500).json({ errors: [{ msg: 'Server error' }] });
  }
});

// Allow the authenticated user to update their own submission by id
router.patch(
  '/:id',
  requireAuth,
  [
    body('title').optional().isString().trim().notEmpty(),
    body('description').optional().isString().trim().notEmpty(),
    body('contentUrl').optional().isString().trim(),
    body('text').optional().isString().trim(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    try {
      const { id } = req.params;
      const patch = {};
      const { title, description, contentUrl, text } = req.body || {};
      if (title !== undefined) patch.title = title;
      if (description !== undefined) patch.description = description;
      if (contentUrl !== undefined) patch.contentUrl = contentUrl;
      if (text !== undefined) patch.text = text;
      const doc = await Submission.findOneAndUpdate({ _id: id, userId: req.userId }, patch, { new: true });
      if (!doc) return res.status(404).json({ errors: [{ msg: 'Not found' }] });
      res.json(doc);
    } catch (e) {
      res.status(500).json({ errors: [{ msg: 'Server error' }] });
    }
  }
);

// Allow the authenticated user to delete their own submission by id
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await Submission.findOneAndDelete({ _id: id, userId: req.userId });
    if (!doc) return res.status(404).json({ errors: [{ msg: 'Not found' }] });
    res.json({ message: 'Deleted' });
  } catch (e) {
    res.status(500).json({ errors: [{ msg: 'Server error' }] });
  }
});

export default router;

