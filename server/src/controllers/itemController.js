import Joi from 'joi';
import bcrypt from 'bcryptjs';
import { Item } from '../models/Item.js';

// TODO: write a validation schema for create/update per README.md section 2.
const createSchema = Joi.object({
  title: Joi.string().min(2).max(60).required(),
  description: Joi.string(),
  category: Joi.string().valid(
    'electronics',
    'clothing',
    'documents',
    'accessories',
    'other'
  ),
  status: Joi.string().valid('lost', 'found', 'claimed'),
  location: Joi.string(),
  reportedBy: Joi.string()
});

const updateSchema = Joi.object({
  title: Joi.string().min(2).max(60),
  description: Joi.string(),
  category: Joi.string().valid(
    'electronics',
    'clothing',
    'documents',
    'accessories',
    'other'
  ),
  status: Joi.string().valid('lost', 'found', 'claimed'),
  location: Joi.string(),
  reportedBy: Joi.string().hex().length(24)
});
// GET /api/items
// TODO: implement per README.md section 3.
export async function getAllItems(req, res, next) {
  try {
       const filter = {};

    if (req.query.status) {
      filter.status = req.query.status;
    }

    if (req.query.category) {
      filter.category = req.query.category;
    }

    const items = await Item.find(filter)
      .sort({ createdAt: -1 })
      .populate('reportedBy', 'name email')
      .lean();

    res.json({ items });
  } catch (err) {
    next(err);
  }
}

// GET /api/items/:id
// TODO: implement per README.md section 3.
export async function getItem(req, res, next) {
  try {
  const item = await Item.findById(req.params.id) .populate('reportedBy', 'name email'); if (!item) { return res.status(404).json({ message: 'Item not found' }); } 
  res.json({ item }); } 
  catch (err) { next(err); }
}

// POST /api/items
// TODO: implement per README.md section 3.
export async function createItem(req, res, next) {
  try {
  const { value, error } = createSchema.validate(req.body); 
  if (error) { return res.status(400).json({ message: error.message }); } 
  const item = await Item.create(value); 
  res.status(201).json({ item }); } catch (err) { next(err);
  } 
  }


// PATCH /api/items/:id
// TODO: implement per README.md section 3.
export async function updateItem(req, res, next) {
  try {
    // Stage 1: Find the item and check if it exists
    const existingItem = await Item.findById(req.params.id);
    if (!existingItem) {
      return res.status(404).json({ message: 'Item not found' });
    }
    // Stage 2: Validate and update the item
    const { value, error } = updateSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) {
      return res.status(400).json({ message: error.message });
    }
    Object.assign(existingItem, value);
    await existingItem.save();
    res.json({ item: existingItem });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/items/:id
// TODO: implement per README.md section 3.
export async function deleteItem(req, res, next) {
  try {
    const item = await Item.findByIdAndDelete(req.params.id); 
    if (!item) { return res.status(404).json({ message: 'Item not found' }); } 
    res.json({ ok: true });
  } catch (err) { next(err); }
}
