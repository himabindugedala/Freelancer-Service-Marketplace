import { User } from '../models/User.js';
import { Service } from '../models/Service.js';
import { Project } from '../models/Project.js';
import { Order } from '../models/Order.js';
import { PaymentRecord } from '../models/PaymentRecord.js';
import { Report } from '../models/Report.js';
import { populateSeedData } from '../scripts/seed.js';

export const triggerSeed = async (req, res, next) => {
  try {
    await populateSeedData();
    res.status(200).json({
      success: true,
      message: 'Demo data seeded successfully.',
    });
  } catch (error) {
    next(error);
  }
};


export const getAdminStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      clientCount,
      freelancerCount,
      totalServices,
      activeProjects,
      totalOrders,
      activeOrders,
      completedOrders,
      totalPayments,
      pendingReports,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'client' }),
      User.countDocuments({ role: 'freelancer' }),
      Service.countDocuments(),
      Project.countDocuments({ status: { $in: ['open', 'in_progress'] } }),
      Order.countDocuments(),
      Order.countDocuments({ status: { $in: ['in_progress', 'delivered', 'revision_requested'] } }),
      Order.countDocuments({ status: 'completed' }),
      PaymentRecord.aggregate([
        { $match: { status: 'success' } },
        { $group: { _id: null, totalVolume: { $sum: '$amount' } } },
      ]),
      Report.countDocuments({ status: 'pending' }),
    ]);

    // Recent orders and users
    const [recentOrders, recentUsers] = await Promise.all([
      Order.find()
        .populate('client', 'name avatar')
        .populate('freelancer', 'name avatar')
        .sort({ createdAt: -1 })
        .limit(5),
      User.find().select('name email role status createdAt avatar').sort({ createdAt: -1 }).limit(5),
    ]);

    res.status(200).json({
      success: true,
      data: {
        metrics: {
          totalUsers,
          clientCount,
          freelancerCount,
          totalServices,
          activeProjects,
          totalOrders,
          activeOrders,
          completedOrders,
          totalVolume: totalPayments[0]?.totalVolume || 0,
          pendingReports,
        },
        recentOrders,
        recentUsers,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminUsers = async (req, res, next) => {
  try {
    const { search, role, status, page = 1, limit = 20 } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    if (role && role !== 'all') query.role = role;
    if (status && status !== 'all') query.status = status;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [users, total] = await Promise.all([
      User.find(query).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      User.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: users,
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

export const toggleUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Administrator accounts cannot be suspended.' });
    }

    user.status = user.status === 'active' ? 'suspended' : 'active';
    await user.save();

    res.status(200).json({
      success: true,
      message: `User account is now ${user.status}.`,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminServices = async (req, res, next) => {
  try {
    const { search, status, page = 1, limit = 20 } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    if (status && status !== 'all') query.status = status;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [services, total] = await Promise.all([
      Service.find(query)
        .populate('freelancer', 'name email avatar')
        .populate('category', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
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

export const getAdminReports = async (req, res, next) => {
  try {
    const { status = 'all' } = req.query;
    const query = {};
    if (status !== 'all') query.status = status;

    const reports = await Report.find(query)
      .populate('reporter', 'name email avatar')
      .populate('resolvedBy', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: reports,
    });
  } catch (error) {
    next(error);
  }
};

export const updateReportStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    const report = await Report.findByIdAndUpdate(
      id,
      {
        status,
        adminNotes: adminNotes || '',
        resolvedBy: req.user._id,
      },
      { new: true }
    );

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    res.status(200).json({
      success: true,
      message: `Report marked as ${status}`,
      data: report,
    });
  } catch (error) {
    next(error);
  }
};
