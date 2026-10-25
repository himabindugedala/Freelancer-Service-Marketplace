import { Order } from '../models/Order.js';
import { Service } from '../models/Service.js';
import { OrderStatusHistory } from '../models/OrderStatusHistory.js';
import { PaymentRecord } from '../models/PaymentRecord.js';
import { transitionOrderStatus } from '../services/orderService.js';
import { createNotification } from '../services/notificationService.js';

export const createDirectOrder = async (req, res, next) => {
  try {
    const { serviceId } = req.body;
    const service = await Service.findById(serviceId).populate('freelancer', 'name email');

    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    if (service.freelancer._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot order your own service.' });
    }

    const orderNumber = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 900 + 100)}`;
    const paymentRef = `ESCROW-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const deadline = new Date();
    deadline.setDate(deadline.getDate() + (service.deliveryTimeDays || 3));

    const order = await Order.create({
      orderNumber,
      client: req.user._id,
      freelancer: service.freelancer._id,
      service: service._id,
      title: service.title,
      agreedPrice: service.price,
      deadline,
      status: 'in_progress',
      paymentStatus: 'escrow_held',
      paymentReference: paymentRef,
    });

    // Increment orders count on service
    await Service.findByIdAndUpdate(service._id, { $inc: { ordersCount: 1 } });

    // Escrow payment record
    await PaymentRecord.create({
      order: order._id,
      payer: req.user._id,
      payee: service.freelancer._id,
      amount: service.price,
      currency: 'USD',
      type: 'escrow_deposit',
      status: 'success',
      referenceId: paymentRef,
      paymentMethod: 'simulated_escrow',
    });

    // History log
    await OrderStatusHistory.create({
      order: order._id,
      fromStatus: 'created',
      toStatus: 'in_progress',
      changedBy: req.user._id,
      notes: `Order created for service "${service.title}". Escrow funded with $${service.price}.`,
    });

    // Notification to freelancer
    await createNotification({
      recipient: service.freelancer._id,
      sender: req.user._id,
      type: 'order_created',
      title: 'New Order Received!',
      message: `${req.user.name} placed an order (#${order.orderNumber}) for your service "${service.title}".`,
      link: `/freelancer/orders/${order._id}`,
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully! Funds held securely in simulated escrow.',
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id)
      .populate('client', 'name email avatar phone')
      .populate('freelancer', 'name email avatar phone')
      .populate('service', 'title coverImage price deliveryTimeDays revisionsAllowed')
      .populate('project', 'title description budgetMin budgetMax');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const isClient = order.client._id.toString() === req.user._id.toString();
    const isFreelancer = order.freelancer._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isClient && !isFreelancer && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Forbidden. You are not a party to this order.' });
    }

    // Fetch status history audit trail
    const history = await OrderStatusHistory.find({ order: order._id })
      .populate('changedBy', 'name role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        ...order.toObject(),
        history,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMyOrders = async (req, res, next) => {
  try {
    const { status, role } = req.query;
    const query = {};

    if (role === 'freelancer' || req.user.role === 'freelancer') {
      query.freelancer = req.user._id;
    } else {
      query.client = req.user._id;
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate('client', 'name avatar')
      .populate('freelancer', 'name avatar')
      .populate('service', 'title coverImage')
      .populate('project', 'title')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

export const submitDelivery = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { deliveryNotes, deliveryFiles } = req.body;

    const updatedOrder = await transitionOrderStatus({
      orderId: id,
      targetStatus: 'delivered',
      userId: req.user._id,
      userRole: req.user.role,
      notes: deliveryNotes,
      deliveryFiles: deliveryFiles || [],
    });

    res.status(200).json({
      success: true,
      message: 'Work delivered successfully. Client has been notified for inspection.',
      data: updatedOrder,
    });
  } catch (error) {
    next(error);
  }
};

export const requestRevision = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { revisionNotes } = req.body;

    const updatedOrder = await transitionOrderStatus({
      orderId: id,
      targetStatus: 'revision_requested',
      userId: req.user._id,
      userRole: req.user.role,
      notes: revisionNotes,
    });

    res.status(200).json({
      success: true,
      message: 'Revision requested. Freelancer has been alerted.',
      data: updatedOrder,
    });
  } catch (error) {
    next(error);
  }
};

export const approveOrder = async (req, res, next) => {
  try {
    const { id } = req.params;

    const updatedOrder = await transitionOrderStatus({
      orderId: id,
      targetStatus: 'completed',
      userId: req.user._id,
      userRole: req.user.role,
      notes: 'Client reviewed and approved order completion.',
    });

    res.status(200).json({
      success: true,
      message: 'Order completed! Escrow payment has been released to the freelancer.',
      data: updatedOrder,
    });
  } catch (error) {
    next(error);
  }
};

export const cancelOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const updatedOrder = await transitionOrderStatus({
      orderId: id,
      targetStatus: 'cancelled',
      userId: req.user._id,
      userRole: req.user.role,
      cancelReason: reason || 'Order cancelled by user',
    });

    res.status(200).json({
      success: true,
      message: 'Order has been cancelled and funds refunded.',
      data: updatedOrder,
    });
  } catch (error) {
    next(error);
  }
};
