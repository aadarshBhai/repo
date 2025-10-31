import express from 'express';
import ApprovedContent from '../models/ApprovedContent.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Get all approved content for the explore page
router.get('/', async (req, res) => {
  try {
    const { category, tribe, village, search, limit = 20, skip = 0 } = req.query;
    
    const query = { status: 'approved' };
    
    if (category) query.category = category;
    if (tribe) query.tribe = tribe;
    if (village) query.village = village;
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tribe: { $regex: search, $options: 'i' } },
        { village: { $regex: search, $options: 'i' } },
      ];
    }
    
    const [items, total] = await Promise.all([
      ApprovedContent.find(query)
        .sort({ createdAt: -1 })
        .skip(parseInt(skip))
        .limit(parseInt(limit))
        .lean(),
      ApprovedContent.countDocuments(query)
    ]);
    
    res.json({ items, total });
  } catch (e) {
    console.error('Error fetching approved content:', e);
    res.status(500).json({ errors: [{ msg: 'Server error' }] });
  }
});

// Get a single approved content item
router.get('/:id', async (req, res) => {
  try {
    const item = await ApprovedContent.findOne({ 
      _id: req.params.id,
      status: 'approved' 
    });
    
    if (!item) {
      return res.status(404).json({ errors: [{ msg: 'Not found' }] });
    }
    
    res.json(item);
  } catch (e) {
    res.status(500).json({ errors: [{ msg: 'Server error' }] });
  }
});

export default router;
