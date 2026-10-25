import { Proposal } from '../models/Proposal.js';
import { Project } from '../models/Project.js';
import { Order } from '../models/Order.js';
import { OrderStatusHistory } from '../models/OrderStatusHistory.js';
import { PaymentRecord } from '../models/PaymentRecord.js';
import { FreelancerProfile } from '../models/FreelancerProfile.js';
import { createNotification } from '../services/notificationService.js';

export const submitProposal = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { coverLetter, bidAmount, deliveryTimeDays } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (project.status !== 'open') {
      return res.status(400).json({
        success: false,
        message: 'This project is no longer accepting new proposals.',
      });
    }

    if (project.client.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot submit a proposal on your own project.',
      });
    }

    // Check for existing proposal
    const existing = await Proposal.findOne({
      project: project._id,
      freelancer: req.user._id,
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'You have already submitted a proposal for this project.',
      });
    }

    const proposal = await Proposal.create({
      project: project._id,
      freelancer: req.user._id,
      coverLetter,
      bidAmount,
      deliveryTimeDays,
      status: 'pending',
    });

    // Increment count on project
    await Project.findByIdAndUpdate(project._id, { $inc: { proposalsCount: 1 } });

    // Notify project client
    await createNotification({
      recipient: project.client,
      sender: req.user._id,
      type: 'proposal_received',
      title: 'New Proposal Received',
      message: `${req.user.name} submitted a bid of $${bidAmount} on "${project.title}".`,
      link: `/client/projects/${project._id}/proposals`,
    });

    const populated = await Proposal.findById(proposal._id)
      .populate('freelancer', 'name avatar')
      .populate('project', 'title budgetMin budgetMax');

    res.status(201).json({
      success: true,
      message: 'Proposal submitted successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

export const getProjectProposals = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (project.client.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden. You do not own this project.' });
    }

    const proposals = await Proposal.find({ project: projectId })
      .populate('freelancer', 'name email avatar createdAt')
      .sort({ createdAt: -1 })
      .lean();

    // Attach freelancer profiles to each proposal
    const freelancerUserIds = proposals.map((p) => p.freelancer._id);
    const profiles = await FreelancerProfile.find({ user: { $in: freelancerUserIds } }).lean();
    const profileMap = new Map();
    profiles.forEach((p) => profileMap.set(p.user.toString(), p));

    const enriched = proposals.map((p) => ({
      ...p,
      freelancerProfile: profileMap.get(p.freelancer._id.toString()) || null,
    }));

    res.status(200).json({
      success: true,
      data: {
        project,
        proposals: enriched,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMyProposals = async (req, res, next) => {
  try {
    const proposals = await Proposal.find({ freelancer: req.user._id })
      .populate({
        path: 'project',
        select: 'title description budgetMin budgetMax budgetType status deadline client',
        populate: { path: 'client', select: 'name avatar' },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: proposals,
    });
  } catch (error) {
    next(error);
  }
};

export const acceptProposal = async (req, res, next) => {
  try {
    const { proposalId } = req.params;

    const proposal = await Proposal.findById(proposalId).populate('project');
    if (!proposal) {
      return res.status(404).json({ success: false, message: 'Proposal not found' });
    }

    const project = await Project.findById(proposal.project._id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (project.client.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden. Only the project owner can hire.' });
    }

    if (project.status !== 'open') {
      return res.status(400).json({
        success: false,
        message: `This project has already been hired or closed (Current status: ${project.status}).`,
      });
    }

    // 1. Mark this proposal as accepted
    proposal.status = 'accepted';
    await proposal.save();

    // 2. Reject all other pending proposals
    await Proposal.updateMany(
      { project: project._id, _id: { $ne: proposal._id }, status: 'pending' },
      { $set: { status: 'rejected' } }
    );

    // 3. Mark project as in_progress
    project.status = 'in_progress';
    project.hiredFreelancer = proposal.freelancer;
    project.acceptedProposal = proposal._id;
    await project.save();

    // 4. Calculate deadline based on deliveryTimeDays
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + (proposal.deliveryTimeDays || 7));

    // 5. Create new Order with escrow hold
    const orderNumber = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 900 + 100)}`;
    const paymentRef = `ESCROW-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const order = await Order.create({
      orderNumber,
      client: project.client,
      freelancer: proposal.freelancer,
      project: project._id,
      proposal: proposal._id,
      title: `Contract: ${project.title}`,
      agreedPrice: proposal.bidAmount,
      deadline,
      status: 'in_progress',
      paymentStatus: 'escrow_held',
      paymentReference: paymentRef,
    });

    // 6. Record payment escrow deposit
    await PaymentRecord.create({
      order: order._id,
      payer: project.client,
      payee: proposal.freelancer,
      amount: proposal.bidAmount,
      currency: 'USD',
      type: 'escrow_deposit',
      status: 'success',
      referenceId: paymentRef,
      paymentMethod: 'simulated_escrow',
    });

    // 7. Audit log
    await OrderStatusHistory.create({
      order: order._id,
      fromStatus: 'created',
      toStatus: 'in_progress',
      changedBy: req.user._id,
      notes: `Proposal accepted and order started. Escrow deposit of $${proposal.bidAmount} confirmed.`,
    });

    // 8. Notify freelancer of hire
    await createNotification({
      recipient: proposal.freelancer,
      sender: req.user._id,
      type: 'proposal_accepted',
      title: "Proposal Accepted! You're Hired!",
      message: `Your bid of $${proposal.bidAmount} on "${project.title}" was accepted. Order #${order.orderNumber} is now in progress.`,
      link: `/freelancer/orders/${order._id}`,
    });

    res.status(200).json({
      success: true,
      message: 'Proposal accepted! Order created and escrow funded.',
      data: {
        order,
        project,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const withdrawProposal = async (req, res, next) => {
  try {
    const { proposalId } = req.params;
    const proposal = await Proposal.findById(proposalId);

    if (!proposal) {
      return res.status(404).json({ success: false, message: 'Proposal not found' });
    }

    if (proposal.freelancer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Forbidden. You do not own this proposal.' });
    }

    if (proposal.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot withdraw a proposal that is already '${proposal.status}'.`,
      });
    }

    proposal.status = 'withdrawn';
    await proposal.save();

    await Project.findByIdAndUpdate(proposal.project, { $inc: { proposalsCount: -1 } });

    res.status(200).json({
      success: true,
      message: 'Proposal withdrawn successfully',
    });
  } catch (error) {
    next(error);
  }
};
