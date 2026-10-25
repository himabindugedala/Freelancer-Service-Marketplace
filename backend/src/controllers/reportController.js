import { Report } from '../models/Report.js';

export const createReport = async (req, res, next) => {
  try {
    const { targetType, targetId, reason, description } = req.body;

    const report = await Report.create({
      reporter: req.user._id,
      targetType,
      targetId,
      reason,
      description: description || '',
    });

    res.status(201).json({
      success: true,
      message: 'Report submitted successfully. Platform administrators will investigate.',
      data: report,
    });
  } catch (error) {
    next(error);
  }
};
