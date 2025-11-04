import express from 'express';
import { body, validationResult } from 'express-validator';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import Submission from '../models/Submission.js';
import Taxonomy from '../models/Taxonomy.js';

const router = express.Router();
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

// List the authenticated user's own submissions (all statuses)
router.get('/mine', requireAuth, async (req, res) => {
  try {
    const { page = 1, limit = DEFAULT_LIMIT } = req.query;
    const skip = (Math.max(1, parseInt(page)) - 1) * Math.min(parseInt(limit), MAX_LIMIT);
    
    const [items, total] = await Promise.all([
      Submission.find({ userId: req.userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Math.min(parseInt(limit), MAX_LIMIT))
        .lean(),
      Submission.countDocuments({ userId: req.userId })
    ]);

    res.json({
      data: items,
      pagination: {
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / Math.min(parseInt(limit), MAX_LIMIT)),
        limit: Math.min(parseInt(limit), MAX_LIMIT)
      }
    });
  } catch (e) {
    console.error('Error fetching user submissions:', e);
    res.status(500).json({ errors: [{ msg: 'Server error' }] });
  }
});

// Enhanced authentication middleware with rate limiting and better error handling
import rateLimit from 'express-rate-limit';

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later.'
});

// Enhanced authentication middleware
function requireAuth(req, res, next) {
  // Skip rate limiting for OPTIONS requests (CORS preflight)
  if (req.method === 'OPTIONS') return next();
  
  // Apply rate limiting to auth endpoints
  authLimiter(req, res, async () => {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    
    if (!token) {
      return res.status(401).json({ 
        errors: [{ 
          msg: 'Authentication required',
          code: 'AUTH_REQUIRED'
        }] 
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET not configured');
      return res.status(500).json({ 
        errors: [{ 
          msg: 'Server configuration error',
          code: 'SERVER_ERROR'
        }] 
      });
    }

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      
      if (!payload?.user?.id) {
        return res.status(401).json({ 
          errors: [{ 
            msg: 'Invalid authentication token',
            code: 'INVALID_TOKEN'
          }] 
        });
      }
      
      // Add user info to request
      req.userId = payload.user.id;
      req.userRole = payload.user.role || 'user';
      
      // Log successful authentication for monitoring
      console.log(`User ${req.userId} authenticated with role ${req.userRole}`);
      
      next();
    } catch (e) {
      console.error('Authentication error:', e);
      
      let errorMsg = 'Authentication failed';
      let statusCode = 401;
      let errorCode = 'AUTH_FAILED';
      
      if (e.name === 'TokenExpiredError') {
        errorMsg = 'Session expired. Please log in again.';
        errorCode = 'TOKEN_EXPIRED';
      } else if (e.name === 'JsonWebTokenError') {
        errorMsg = 'Invalid token';
        errorCode = 'INVALID_TOKEN';
      } else {
        statusCode = 500;
        errorCode = 'SERVER_ERROR';
      }
      
      return res.status(statusCode).json({ 
        errors: [{ 
          msg: errorMsg,
          code: errorCode,
          ...(process.env.NODE_ENV === 'development' && { debug: e.message })
        }] 
      });
    }
  });
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
      // Upsert taxonomy so new tribes/villages appear for everyone immediately
      if (country && state) {
        const update = { $setOnInsert: { country, state }, $addToSet: {} };
        if (tribe) update.$addToSet.tribes = String(tribe).toLowerCase();
        if (village) update.$addToSet.villages = String(village);
        await Taxonomy.findOneAndUpdate(
          { country, state },
          update,
          { upsert: true, new: true }
        ).catch(() => {});
      }
      res.status(201).json(doc);
    } catch (e) {
      res.status(500).json({ errors: [{ msg: 'Server error' }] });
    }
  }
);

// Get submissions with pagination and filtering
router.get('/', async (req, res) => {
  try {
    const { 
      status = 'approved', 
      category, 
      tribe, 
      country, 
      state, 
      village, 
      search,
      page = 1,
      limit = DEFAULT_LIMIT,
      sort = '-createdAt'
    } = req.query;

    // Build filter
    const filter = {};
    
    // Status filtering (default to approved for non-admin)
    if (status !== 'all') {
      filter.status = status;
    }

    // Regular filters
    if (category) filter.category = category;
    if (tribe) filter.tribe = String(tribe).toLowerCase();
    if (country) filter.country = country;
    if (state) filter.state = state;
    if (village) filter.village = village;

    // Text search
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { text: { $regex: search, $options: 'i' } }
      ];
    }

    // Validate and sanitize pagination
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(parseInt(limit), MAX_LIMIT);
    const skip = (pageNum - 1) * limitNum;

    // Execute queries in parallel
    const [items, total] = await Promise.all([
      Submission.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Submission.countDocuments(filter)
    ]);

    // Add cache control headers
    res.set('Cache-Control', 'public, max-age=60');
    
    res.json({
      data: items,
      pagination: {
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum),
        limit: limitNum
      }
    });
  } catch (e) {
    console.error('Error fetching submissions:', e);
    res.status(500).json({ 
      errors: [{ 
        msg: 'Server error',
        ...(process.env.NODE_ENV === 'development' && { debug: e.message })
      }] 
    });
  }
});

// Cache for tribe data (in-memory, consider Redis for production)
const tribeCache = new Map();
const TRIBES_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Get distinct tribes with caching
router.get('/tribes', async (req, res) => {
  try {
    const { country, state } = req.query;
    const cacheKey = `tribes:${country || 'all'}:${state || 'all'}`;
    const cached = tribeCache.get(cacheKey);
    
    // Return cached data if available and not expired
    if (cached && (Date.now() - cached.timestamp < TRIBES_CACHE_TTL)) {
      return res.json(cached.data);
    }

    const filter = { status: 'approved' };
    if (country) filter.country = country;
    if (state) filter.state = state;

    const [tribes, taxonomy] = await Promise.all([
      Submission.distinct('tribe', filter),
      (country && state) 
        ? Taxonomy.findOne({ country, state }).lean() 
        : Promise.resolve(null)
    ]);

    // Process and merge data
    const merged = [
      ...tribes.filter(Boolean).map(t => String(t).toLowerCase()),
      ...(taxonomy?.tribes?.filter(Boolean).map(t => String(t).toLowerCase()) || [])
    ];
    
    const deduped = [...new Set(merged)].sort();
    
    // Update cache
    tribeCache.set(cacheKey, {
      data: deduped,
      timestamp: Date.now()
    });

    res.set('Cache-Control', 'public, max-age=300'); // 5 minutes browser cache
    res.json(deduped);
  } catch (e) {
    console.error('Error fetching tribes:', e);
    res.status(500).json({ 
      errors: [{ 
        msg: 'Failed to fetch tribes',
        ...(process.env.NODE_ENV === 'development' && { debug: e.message })
      }] 
    });
  }
});

// Cache for village data
const villageCache = new Map();
const VILLAGES_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Get distinct villages with caching
router.get('/villages', async (req, res) => {
  try {
    const { tribe, country, state } = req.query;
    const cacheKey = `villages:${tribe || 'all'}:${country || 'all'}:${state || 'all'}`;
    const cached = villageCache.get(cacheKey);
    
    // Return cached data if available and not expired
    if (cached && (Date.now() - cached.timestamp < VILLAGES_CACHE_TTL)) {
      return res.json(cached.data);
    }

    const filter = { status: 'approved' };
    if (tribe) filter.tribe = String(tribe).toLowerCase();
    if (country) filter.country = country;
    if (state) filter.state = state;

    const [villages, taxonomy] = await Promise.all([
      Submission.distinct('village', filter),
      (country && state) 
        ? Taxonomy.findOne({ country, state }).lean() 
        : Promise.resolve(null)
    ]);

    // Process and merge data
    const merged = [
      ...villages.filter(Boolean).map(v => String(v)),
      ...(taxonomy?.villages?.filter(Boolean).map(v => String(v)) || [])
    ];
    
    const deduped = [...new Set(merged)].sort();
    
    // Update cache
    villageCache.set(cacheKey, {
      data: deduped,
      timestamp: Date.now()
    });

    res.set('Cache-Control', 'public, max-age=300'); // 5 minutes browser cache
    res.json(deduped);
  } catch (e) {
    console.error('Error fetching villages:', e);
    res.status(500).json({ 
      errors: [{ 
        msg: 'Failed to fetch villages',
        ...(process.env.NODE_ENV === 'development' && { debug: e.message })
      }] 
    });
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

