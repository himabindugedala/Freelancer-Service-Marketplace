import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
      maxlength: 150,
    },
    description: {
      type: String,
      required: [true, 'Project description is required'],
      trim: true,
      maxlength: 6000,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
      index: true,
    },
    skills: [
      {
        type: String,
        trim: true,
      },
    ],
    budgetType: {
      type: String,
      enum: ['fixed', 'hourly'],
      default: 'fixed',
    },
    budgetMin: {
      type: Number,
      required: true,
      min: 5,
    },
    budgetMax: {
      type: Number,
      required: true,
      min: 5,
    },
    deadline: {
      type: Date,
      required: true,
    },
    attachments: [
      {
        name: String,
        url: String,
        fileType: String,
      },
    ],
    status: {
      type: String,
      enum: ['open', 'in_progress', 'completed', 'cancelled'],
      default: 'open',
      index: true,
    },
    hiredFreelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    acceptedProposal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Proposal',
      default: null,
    },
    proposalsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

projectSchema.index({ status: 1, category: 1, createdAt: -1 });
projectSchema.index({ skills: 1 });
projectSchema.index({ title: 'text', description: 'text' });

export const Project = mongoose.model('Project', projectSchema);
