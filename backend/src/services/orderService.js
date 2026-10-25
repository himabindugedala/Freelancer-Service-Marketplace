import { Order } from '../models/Order.js';
import { OrderStatusHistory } from '../models/OrderStatusHistory.js';
import { PaymentRecord } from '../models/PaymentRecord.js';
import { User } from '../models/User.js';
import { FreelancerProfile } from '../models/FreelancerProfile.js';
import { createNotification } from './notificationService.js';

export const allowedTransitions = {
  in_progress: ['delivered', 'cancelled'],
  delivered: ['revision_requested', 'completed', 'cancelled'],
  revision_requested: ['delivered', 'cancelled'],
  completed: [], // Terminal state
  cancelled: [], // Terminal state
};

export const transitionOrderStatus = async ({
  orderId,
  targetStatus,
  userId,
  userRole,
  notes = '',
  deliveryFiles = [],
  cancelReason = '',
}) => {
  const order = await Order.findById(orderId);
  if (!order) {
    throw new Error('Order not found');
  }

  // Permission checks
  const isClient = order.client.toString() === userId.toString();
  const isFreelancer = order.freelancer.toString() === userId.toString();
  const isAdmin = userRole === 'admin';

  if (!isClient && !isFreelancer && !isAdmin) {
    throw new Error('Unauthorized: You are not a participant in this order');
  }

  const validNextStates = allowedTransitions[order.status] || [];
  if (!validNextStates.includes(targetStatus) && !isAdmin) {
    throw new Error(`Invalid status transition from '${order.status}' to '${targetStatus}'.`);
  }

  // Specific role restrictions
  if (targetStatus === 'delivered' && !isFreelancer && !isAdmin) {
    throw new Error('Only the assigned freelancer can submit work delivery');
  }

  if (targetStatus === 'revision_requested' && !isClient && !isAdmin) {
    throw new Error('Only the client can request a revision');
  }

  if (targetStatus === 'completed' && !isClient && !isAdmin) {
    throw new Error('Only the client can approve order completion');
  }

  const previousStatus = order.status;
  order.status = targetStatus;

  // Handle specific transitions
  if (targetStatus === 'delivered') {
    order.deliveryNotes = notes;
    if (deliveryFiles && deliveryFiles.length > 0) {
      order.deliveryFiles = [...order.deliveryFiles, ...deliveryFiles];
    }
  } else if (targetStatus === 'revision_requested') {
    order.revisionNotes = notes;
    order.revisionCount = (order.revisionCount || 0) + 1;
  } else if (targetStatus === 'completed') {
    order.completedAt = new Date();
    order.paymentStatus = 'released';

    // Release payment from escrow to freelancer's earnings
    await User.findByIdAndUpdate(order.freelancer, {
      $inc: { walletBalance: order.agreedPrice },
    });

    await FreelancerProfile.findOneAndUpdate(
      { user: order.freelancer },
      {
        $inc: {
          earningsTotal: order.agreedPrice,
          completedOrdersCount: 1,
        },
      }
    );

    // Create payment release record
    await PaymentRecord.create({
      order: order._id,
      payer: order.client,
      payee: order.freelancer,
      amount: order.agreedPrice,
      currency: 'USD',
      type: 'escrow_release',
      status: 'success',
      referenceId: `REL-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      paymentMethod: 'simulated_escrow',
    });
  } else if (targetStatus === 'cancelled') {
    order.cancelledAt = new Date();
    order.cancelReason = cancelReason || notes;
    order.paymentStatus = 'refunded';

    // Refund client wallet
    await User.findByIdAndUpdate(order.client, {
      $inc: { walletBalance: order.agreedPrice },
    });

    await PaymentRecord.create({
      order: order._id,
      payer: order.freelancer,
      payee: order.client,
      amount: order.agreedPrice,
      currency: 'USD',
      type: 'refund',
      status: 'success',
      referenceId: `REF-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      paymentMethod: 'simulated_escrow',
    });
  }

  await order.save();

  // Audit history log
  await OrderStatusHistory.create({
    order: order._id,
    fromStatus: previousStatus,
    toStatus: targetStatus,
    changedBy: userId,
    notes: notes || cancelReason || `Status changed to ${targetStatus}`,
  });

  // Send contextual notifications
  if (targetStatus === 'delivered') {
    await createNotification({
      recipient: order.client,
      sender: order.freelancer,
      type: 'order_delivered',
      title: 'Work Delivered for Your Order',
      message: `Freelancer has delivered work for order #${order.orderNumber}. Please inspect and approve or request revisions.`,
      link: `/client/orders/${order._id}`,
    });
  } else if (targetStatus === 'revision_requested') {
    await createNotification({
      recipient: order.freelancer,
      sender: order.client,
      type: 'revision_requested',
      title: 'Revision Requested',
      message: `Client requested changes on order #${order.orderNumber}: "${notes}"`,
      link: `/freelancer/orders/${order._id}`,
    });
  } else if (targetStatus === 'completed') {
    await createNotification({
      recipient: order.freelancer,
      sender: order.client,
      type: 'order_completed',
      title: 'Order Completed & Escrow Released!',
      message: `Congratulations! Order #${order.orderNumber} was marked completed. $${order.agreedPrice} has been credited to your earnings.`,
      link: `/freelancer/orders/${order._id}`,
    });
  } else if (targetStatus === 'cancelled') {
    const notifyTarget = isClient ? order.freelancer : order.client;
    await createNotification({
      recipient: notifyTarget,
      sender: userId,
      type: 'order_cancelled',
      title: `Order #${order.orderNumber} Cancelled`,
      message: `Order was cancelled. Reason: ${cancelReason || notes || 'Not specified'}`,
      link: `/orders/${order._id}`,
    });
  }

  return order;
};
