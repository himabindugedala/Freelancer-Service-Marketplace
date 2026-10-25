import mongoose from 'mongoose';

const portfolioItemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  image: { type: String, default: '' },
  projectUrl: { type: String, default: '' },
  tags: [{ type: String }],
  completedAt: { type: Date, default: Date.now },
});

const freelancerProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    headline: {
      type: String,
      default: 'Professional Freelancer',
      maxlength: 120,
    },
    bio: {
      type: String,
      default: '',
      maxlength: 2000,
    },
    skills: [
      {
        type: String,
        trim: true,
      },
    ],
    hourlyRate: {
      type: Number,
      default: 25,
      min: 5,
    },
    availability: {
      type: String,
      enum: ['available', 'busy', 'not_available'],
      default: 'available',
    },
    languages: [
      {
        type: String,
        trim: true,
      },
    ],
    experienceLevel: {
      type: String,
      enum: ['entry', 'intermediate', 'expert'],
      default: 'intermediate',
    },
    portfolio: [portfolioItemSchema],
    ratingAvg: {
      type: Number,
      default: 5.0,
      min: 0,
      max: 5,
    },
    ratingCount: {
      type: Number,
      default: 0,
    },
    completedOrdersCount: {
      type: Number,
      default: 0,
    },
    earningsTotal: {
      type: Number,
      default: 0,
    },
    socialLinks: {
      github: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      website: { type: String, default: '' },
    },
  },
  {
    timestamps: true,
  }
);

freelancerProfileSchema.index({ skills: 1 });
freelancerProfileSchema.index({ ratingAvg: -1 });
freelancerProfileSchema.index({ hourlyRate: 1 });

export const FreelancerProfile = mongoose.model('FreelancerProfile', freelancerProfileSchema);
