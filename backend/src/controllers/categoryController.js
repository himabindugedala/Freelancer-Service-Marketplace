import { Category } from '../models/Category.js';
import { Service } from '../models/Service.js';

export const getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ displayOrder: 1, name: 1 });

    // Aggregate active service count per category
    const categoryCounts = await Service.aggregate([
      { $match: { status: 'published' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    const countMap = new Map();
    categoryCounts.forEach((item) => {
      countMap.set(item._id.toString(), item.count);
    });

    const enrichedCategories = categories.map((cat) => ({
      ...cat.toObject(),
      servicesCount: countMap.get(cat._id.toString()) || 0,
    }));

    res.status(200).json({
      success: true,
      data: enrichedCategories,
    });
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req, res, next) => {
  try {
    const { name, description, icon, image, displayOrder } = req.body;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const category = await Category.create({
      name,
      slug,
      description,
      icon: icon || 'Layers',
      image: image || '',
      displayOrder: displayOrder || 0,
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };
    if (updates.name) {
      updates.slug = updates.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }

    const category = await Category.findByIdAndUpdate(id, updates, { new: true });
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await Category.findByIdAndDelete(id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Category removed successfully',
    });
  } catch (error) {
    next(error);
  }
};
