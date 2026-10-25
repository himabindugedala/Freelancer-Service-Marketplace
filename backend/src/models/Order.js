import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      required: true,
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      default: null,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      default: null,
    },
    proposal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Proposal',
      default: null,
    },
    title: {
      type: String,
      required: true,
    },
    agreedPrice: {
      type: Number,
      required: true,
      min: 5,
    },
    deadline: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['in_progress', 'delivered', 'revision_requested', 'completed', 'cancelled'],
      default: 'in_progress',
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ['escrow_held', 'released', 'refunded'],
      default: 'escrow_held',
      index: true,
    },
    paymentReference: {
      type: String,
      required: true,
    },
    deliveryNotes: {
      type: String,
      default: '',
    },
    deliveryFiles: [
      {
        name: String,
        url: String,
        size: Number,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    revisionNotes: {
      type: String,
      default: '',
    },
    revisionCount: {
      type: Number,
      default: 0,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
    cancelReason: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

orderSchema.index({ client: 1, status: 1 });
orderSchema.index({ freelancer: 1, status: 1 });

export const Order = mongoose.model('Order', orderSchema);
