import { Service } from '../models/Service.js';
import { Category } from '../models/Category.js';
import { FreelancerProfile } from '../models/FreelancerProfile.js';
import { Review } from '../models/Review.js';

export const getServices = async (req, res, next) => {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      minRating,
      deliveryTime,
      sort = 'newest',
      page = 1,
      limit = 12,
    } = req.query;

    const query = { status: 'published' };

    // Search keyword
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { skills: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    // Category filter
    if (category && category !== 'all') {
      if (category.match(/^[0-9a-fA-F]{24}$/)) {
        query.category = category;
      } else {
        const catDoc = await Category.findOne({ slug: category });
        if (catDoc) query.category = catDoc._id;
      }
    }

    // Price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Minimum rating
    if (minRating) {
      query.ratingAvg = { $gte: Number(minRating) };
    }

    // Delivery time (max days)
    if (deliveryTime) {
      query.deliveryTimeDays = { $lte: Number(deliveryTime) };
    }

    // Sorting
    let sortOptions = { createdAt: -1 };
    if (sort === 'price_asc') sortOptions = { price: 1 };
    else if (sort === 'price_desc') sortOptions = { price: -1 };
    else if (sort === 'rating_desc') sortOptions = { ratingAvg: -1, ratingCount: -1 };
    else if (sort === 'popular') sortOptions = { ordersCount: -1 };

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [services, total] = await Promise.all([
      Service.find(query)
        .populate('freelancer', 'name avatar')
        .populate('category', 'name slug icon')
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Service.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: services,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getServiceById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const service = await Service.findById(id)
      .populate('freelancer', 'name avatar phone email createdAt')
      .populate('category', 'name slug icon');

    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    // Fetch freelancer profile
    const freelancerProfile = await FreelancerProfile.findOne({ user: service.freelancer._id });

    // Fetch reviews for this service
    const reviews = await Review.find({ service: service._id })
      .populate('client', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: {
        ...service.toObject(),
        freelancerProfile,
        reviews,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createService = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      skills,
      pricingType,
      price,
      deliveryTimeDays,
      revisionsAllowed,
      coverImage,
      galleryImages,
      status,
    } = req.body;

    const service = await Service.create({
      freelancer: req.user._id,
      title,
      description,
      category,
      skills: Array.isArray(skills) ? skills : [skills],
      pricingType: pricingType || 'fixed',
      price,
      deliveryTimeDays,
      revisionsAllowed: revisionsAllowed ?? 2,
      coverImage: coverImage || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80',
      galleryImages: galleryImages || [],
      status: status || 'published',
    });

    const populated = await Service.findById(service._id)
      .populate('freelancer', 'name avatar')
      .populate('category', 'name slug icon');

    res.status(201).json({
      success: true,
      message: 'Service published successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

export const updateService = async (req, res, next) => {
  try {
    const { id } = req.params;
    const service = await Service.findById(id);

    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    if (service.freelancer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden. You do not own this service.' });
    }

    const updated = await Service.findByIdAndUpdate(id, { $set: req.body }, { new: true })
      .populate('freelancer', 'name avatar')
      .populate('category', 'name slug icon');

    res.status(200).json({
      success: true,
      message: 'Service updated successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteService = async (req, res, next) => {
  try {
    const { id } = req.params;
    const service = await Service.findById(id);

    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    if (service.freelancer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden. You do not own this service.' });
    }

    await Service.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Service deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getMyServices = async (req, res, next) => {
  try {
    const services = await Service.find({ freelancer: req.user._id })
      .populate('category', 'name slug icon')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: services,
    });
  } catch (error) {
    next(error);
  }
};
