import { FreelancerProfile } from '../models/FreelancerProfile.js';
import { User } from '../models/User.js';
import { Service } from '../models/Service.js';
import { Review } from '../models/Review.js';

export const getFreelancers = async (req, res, next) => {
  try {
    const {
      search,
      skill,
      minRate,
      maxRate,
      minRating,
      availability,
      sort = 'rating_desc',
      page = 1,
      limit = 12,
    } = req.query;

    const profileQuery = {};

    if (skill) {
      profileQuery.skills = { $in: [new RegExp(skill, 'i')] };
    }

    if (minRate || maxRate) {
      profileQuery.hourlyRate = {};
      if (minRate) profileQuery.hourlyRate.$gte = Number(minRate);
      if (maxRate) profileQuery.hourlyRate.$lte = Number(maxRate);
    }

    if (minRating) {
      profileQuery.ratingAvg = { $gte: Number(minRating) };
    }

    if (availability && availability !== 'all') {
      profileQuery.availability = availability;
    }

    // Sorting
    let sortOptions = { ratingAvg: -1, completedOrdersCount: -1 };
    if (sort === 'rate_asc') sortOptions = { hourlyRate: 1 };
    else if (sort === 'rate_desc') sortOptions = { hourlyRate: -1 };
    else if (sort === 'completed_desc') sortOptions = { completedOrdersCount: -1 };
    else if (sort === 'newest') sortOptions = { createdAt: -1 };

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    // Build user match criteria if search is applied
    const userMatch = { status: 'active' };
    if (search) {
      userMatch.$or = [
        { name: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } },
      ];
    }

    const profiles = await FreelancerProfile.find(profileQuery)
      .populate({
        path: 'user',
        match: userMatch,
        select: 'name email avatar bio status createdAt',
      })
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Filter out profiles whose user didn't match the search
    const filtered = profiles.filter((p) => p.user !== null);
    const total = await FreelancerProfile.countDocuments(profileQuery);

    res.status(200).json({
      success: true,
      data: filtered,
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

export const getFreelancerById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if ID is userId or profileId
    let profile = await FreelancerProfile.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { user: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
    }).populate('user', 'name email avatar phone bio status createdAt');

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Freelancer profile not found' });
    }

    // Fetch published services by this freelancer
    const services = await Service.find({
      freelancer: profile.user._id,
      status: 'published',
    }).populate('category', 'name slug icon');

    // Fetch client reviews
    const reviews = await Review.find({ freelancer: profile.user._id })
      .populate('client', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({
      success: true,
      data: {
        ...profile.toObject(),
        services,
        reviews,
      },
    });
  } catch (error) {
    next(error);
  }
};
