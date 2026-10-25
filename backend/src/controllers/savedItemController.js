import { SavedItem } from '../models/SavedItem.js';

export const toggleSaveItem = async (req, res, next) => {
  try {
    const { itemType, itemId } = req.body;
    const userId = req.user._id;

    if (!['service', 'freelancer'].includes(itemType)) {
      return res.status(400).json({ success: false, message: 'itemType must be service or freelancer' });
    }

    const query = {
      user: userId,
      itemType,
      ...(itemType === 'service' ? { service: itemId } : { freelancer: itemId }),
    };

    const existing = await SavedItem.findOne(query);

    if (existing) {
      await SavedItem.findByIdAndDelete(existing._id);
      return res.status(200).json({
        success: true,
        isSaved: false,
        message: 'Item removed from saved favorites',
      });
    }

    await SavedItem.create({
      user: userId,
      itemType,
      service: itemType === 'service' ? itemId : null,
      freelancer: itemType === 'freelancer' ? itemId : null,
    });

    res.status(201).json({
      success: true,
      isSaved: true,
      message: 'Item saved to favorites',
    });
  } catch (error) {
    next(error);
  }
};

export const getSavedItems = async (req, res, next) => {
  try {
    const items = await SavedItem.find({ user: req.user._id })
      .populate({
        path: 'service',
        populate: [
          { path: 'freelancer', select: 'name avatar' },
          { path: 'category', select: 'name slug icon' },
        ],
      })
      .populate('freelancer', 'name avatar email');

    res.status(200).json({
      success: true,
      data: items,
    });
  } catch (error) {
    next(error);
  }
};
