import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      default: null,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      default: null,
    },
    lastMessage: {
      type: String,
      default: '',
    },
    lastMessageSender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
    unreadCounts: {
      type: Map,
      of: Number,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

conversationSchema.index({ participants: 1 });
conversationSchema.index({ lastMessageAt: -1 });

export const Conversation = mongoose.model('Conversation', conversationSchema);
