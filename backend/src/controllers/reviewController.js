import { Review } from '../models/Review.js';
import { Order } from '../models/Order.js';
import { FreelancerProfile } from '../models/FreelancerProfile.js';
import { Service } from '../models/Service.js';
import { createNotification } from '../services/notificationService.js';

export const createReview = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { rating, comment } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the ordering client can review this order.' });
    }

    if (order.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Reviews can only be submitted for completed orders.',
      });
    }

    const existingReview = await Review.findOne({ order: order._id, client: req.user._id });
    if (existingReview) {
      return res.status(409).json({
        success: false,
        message: 'You have already submitted a review for this order.',
      });
    }

    const review = await Review.create({
      order: order._id,
      service: order.service || null,
      client: req.user._id,
      freelancer: order.freelancer,
      rating,
      comment,
    });

    // Recalculate Freelancer Profile ratings
    const freelancerReviews = await Review.find({ freelancer: order.freelancer });
    const fCount = freelancerReviews.length;
    const fAvg = freelancerReviews.reduce((sum, r) => sum + r.rating, 0) / fCount;

    await FreelancerProfile.findOneAndUpdate(
      { user: order.freelancer },
      {
        $set: {
          ratingAvg: Number(fAvg.toFixed(2)),
          ratingCount: fCount,
        },
      }
    );

    // If order was for a specific service, recalculate service ratings
    if (order.service) {
      const serviceReviews = await Review.find({ service: order.service });
      const sCount = serviceReviews.length;
      const sAvg = serviceReviews.reduce((sum, r) => sum + r.rating, 0) / sCount;

      await Service.findByIdAndUpdate(order.service, {
        $set: {
          ratingAvg: Number(sAvg.toFixed(2)),
          ratingCount: sCount,
        },
      });
    }

    // Notify freelancer of review
    await createNotification({
      recipient: order.freelancer,
      sender: req.user._id,
      type: 'review_received',
      title: 'New Client Review Received',
      message: `${req.user.name} rated you ${rating} ★: "${comment.slice(0, 80)}..."`,
      link: `/freelancers/${order.freelancer}`,
    });

    const populatedReview = await Review.findById(review._id).populate('client', 'name avatar');

    res.status(201).json({
      success: true,
      message: 'Review published successfully! Thank you for your feedback.',
      data: populatedReview,
    });
  } catch (error) {
    next(error);
  }
};

export const getFreelancerReviews = async (req, res, next) => {
  try {
    const { freelancerId } = req.params;
    const reviews = await Review.find({ freelancer: freelancerId })
      .populate('client', 'name avatar')
      .populate('service', 'title')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
};
