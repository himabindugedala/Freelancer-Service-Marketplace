import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';
import { User } from '../models/User.js';
import { Message } from '../models/Message.js';
import { Conversation } from '../models/Conversation.js';

let ioInstance = null;

export const setIO = (io) => {
  ioInstance = io;
};

export const getIO = () => ioInstance;

export const sendNotificationToUser = (userId, notificationData) => {
  if (ioInstance) {
    ioInstance.to(`user:${userId.toString()}`).emit('new_notification', notificationData);
  }
};

export const initSocket = (io) => {
  setIO(io);

  // Authenticate socket handshake using JWT
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (!token) {
        return next(new Error('Socket authentication error: Token missing'));
      }

      const decoded = jwt.verify(token, ENV.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (!user || user.status === 'suspended') {
        return next(new Error('Socket authentication error: Account unauthorized or suspended'));
      }

      socket.user = user;
      next();
    } catch (err) {
      next(new Error(`Socket authentication error: ${err.message}`));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user._id.toString();
    console.log(`[Socket] User connected: ${socket.user.name} (${userId})`);

    // Join dedicated user room for private notifications and messaging
    socket.join(`user:${userId}`);

    // Join a specific conversation room
    socket.on('join_conversation', async (conversationId) => {
      try {
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) return;

        // Verify membership
        const isMember = conversation.participants.some(
          (p) => p.toString() === userId
        );
        if (isMember) {
          socket.join(`conv:${conversationId}`);
          console.log(`[Socket] User ${userId} joined room conv:${conversationId}`);
        }
      } catch (err) {
        console.error('[Socket] join_conversation error:', err);
      }
    });

    socket.on('leave_conversation', (conversationId) => {
      socket.leave(`conv:${conversationId}`);
    });

    // Real-time direct message event
    socket.on('send_message', async ({ conversationId, text, attachments }, callback) => {
      try {
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
          if (callback) callback({ error: 'Conversation not found' });
          return;
        }

        const isMember = conversation.participants.some(
          (p) => p.toString() === userId
        );
        if (!isMember) {
          if (callback) callback({ error: 'Unauthorized to post to this conversation' });
          return;
        }

        const recipientId = conversation.participants.find(
          (p) => p.toString() !== userId
        );

        const newMsg = await Message.create({
          conversation: conversationId,
          sender: userId,
          recipient: recipientId,
          text,
          attachments: attachments || [],
          isRead: false,
        });

        // Update conversation summary
        conversation.lastMessage = text || (attachments?.length ? 'Sent an attachment' : '');
        conversation.lastMessageSender = userId;
        conversation.lastMessageAt = new Date();

        const currentUnread = conversation.unreadCounts?.get(recipientId.toString()) || 0;
        if (!conversation.unreadCounts) conversation.unreadCounts = new Map();
        conversation.unreadCounts.set(recipientId.toString(), currentUnread + 1);
        await conversation.save();

        const populatedMsg = await Message.findById(newMsg._id)
          .populate('sender', 'name avatar role')
          .populate('recipient', 'name avatar role');

        // Broadcast to conversation room and to recipient's personal room
        io.to(`conv:${conversationId}`).emit('receive_message', populatedMsg);
        io.to(`user:${recipientId.toString()}`).emit('message_notification', {
          conversationId,
          message: populatedMsg,
        });

        if (callback) callback({ success: true, message: populatedMsg });
      } catch (err) {
        console.error('[Socket] send_message error:', err);
        if (callback) callback({ error: err.message });
      }
    });

    socket.on('typing', ({ conversationId, isTyping }) => {
      socket.to(`conv:${conversationId}`).emit('user_typing', {
        userId,
        userName: socket.user.name,
        isTyping,
      });
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] User disconnected: ${socket.user.name}`);
    });
  });
};
