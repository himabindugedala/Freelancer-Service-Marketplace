import mongoose from 'mongoose';

const proposalSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },
    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    coverLetter: {
      type: String,
      required: [true, 'Cover letter is required'],
      trim: true,
      minlength: 20,
      maxlength: 3000,
    },
    bidAmount: {
      type: Number,
      required: [true, 'Bid amount is required'],
      min: 5,
    },
    deliveryTimeDays: {
      type: Number,
      required: [true, 'Estimated delivery time is required'],
      min: 1,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'withdrawn'],
      default: 'pending',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate active proposals for same project & freelancer
proposalSchema.index({ project: 1, freelancer: 1 }, { unique: true });

export const Proposal = mongoose.model('Proposal', proposalSchema);
