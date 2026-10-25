import { Conversation } from '../models/Conversation.js';
import { Message } from '../models/Message.js';

export const getConversations = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const conversations = await Conversation.find({
      participants: userId,
    })
      .populate('participants', 'name email avatar role status')
      .populate('lastMessageSender', 'name')
      .populate('project', 'title')
      .populate('order', 'orderNumber title')
      .sort({ lastMessageAt: -1 })
      .lean();

    // Map unread counts for current user
    const formatted = conversations.map((conv) => {
      const otherParticipant = conv.participants.find(
        (p) => p._id.toString() !== userId.toString()
      );
      const unreadCount = conv.unreadCounts?.[userId.toString()] || 0;
      return {
        ...conv,
        otherParticipant,
        unreadCount,
      };
    });

    res.status(200).json({
      success: true,
      data: formatted,
    });
  } catch (error) {
    next(error);
  }
};

export const getOrCreateConversation = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { recipientId, projectId, orderId } = req.body;

    if (!recipientId) {
      return res.status(400).json({ success: false, message: 'Recipient ID is required' });
    }

    if (recipientId.toString() === userId.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot start conversation with yourself' });
    }

    let conversation = await Conversation.findOne({
      participants: { $all: [userId, recipientId], $size: 2 },
    })
      .populate('participants', 'name email avatar role status')
      .populate('project', 'title')
      .populate('order', 'orderNumber title');

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [userId, recipientId],
        project: projectId || null,
        order: orderId || null,
        lastMessage: 'Conversation started',
        lastMessageAt: new Date(),
      });

      conversation = await Conversation.findById(conversation._id)
        .populate('participants', 'name email avatar role status')
        .populate('project', 'title')
        .populate('order', 'orderNumber title');
    }

    res.status(200).json({
      success: true,
      data: conversation,
    });
  } catch (error) {
    next(error);
  }
};

export const getMessages = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    const isMember = conversation.participants.some(
      (p) => p.toString() === userId.toString()
    );
    if (!isMember && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden. You are not in this conversation.' });
    }

    const messages = await Message.find({ conversation: conversationId })
      .populate('sender', 'name avatar role')
      .populate('recipient', 'name avatar role')
      .sort({ createdAt: 1 })
      .limit(200);

    // Clear unread count for current user
    if (conversation.unreadCounts && conversation.unreadCounts.has(userId.toString())) {
      conversation.unreadCounts.set(userId.toString(), 0);
      await conversation.save();
    }

    // Mark messages as read
    await Message.updateMany(
      { conversation: conversationId, recipient: userId, isRead: false },
      { $set: { isRead: true } }
    );

    res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    const conversation = await Conversation.findById(conversationId);
    if (conversation) {
      if (!conversation.unreadCounts) conversation.unreadCounts = new Map();
      conversation.unreadCounts.set(userId.toString(), 0);
      await conversation.save();

      await Message.updateMany(
        { conversation: conversationId, recipient: userId, isRead: false },
        { $set: { isRead: true } }
      );
    }

    res.status(200).json({ success: true, message: 'Messages marked as read' });
  } catch (error) {
    next(error);
  }
};
