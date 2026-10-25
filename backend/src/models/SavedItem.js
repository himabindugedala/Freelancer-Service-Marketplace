import mongoose from 'mongoose';

const savedItemSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    itemType: {
      type: String,
      enum: ['service', 'freelancer'],
      required: true,
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      default: null,
    },
    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

savedItemSchema.index({ user: 1, itemType: 1, service: 1, freelancer: 1 }, { unique: true });

export const SavedItem = mongoose.model('SavedItem', savedItemSchema);
