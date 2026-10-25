import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema(
  {
    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Service title is required'],
      trim: true,
      maxlength: 120,
    },
    description: {
      type: String,
      required: [true, 'Service description is required'],
      trim: true,
      maxlength: 5000,
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
    pricingType: {
      type: String,
      enum: ['fixed', 'starting_at'],
      default: 'fixed',
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 5,
    },
    deliveryTimeDays: {
      type: Number,
      required: true,
      min: 1,
    },
    revisionsAllowed: {
      type: Number,
      default: 2,
      min: 0,
    },
    coverImage: {
      type: String,
      default: '',
    },
    galleryImages: [
      {
        type: String,
      },
    ],
    status: {
      type: String,
      enum: ['published', 'draft', 'paused'],
      default: 'published',
      index: true,
    },
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
    ordersCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

serviceSchema.index({ title: 'text', description: 'text', skills: 'text' });
serviceSchema.index({ category: 1, status: 1, price: 1 });
serviceSchema.index({ ratingAvg: -1 });

export const Service = mongoose.model('Service', serviceSchema);
