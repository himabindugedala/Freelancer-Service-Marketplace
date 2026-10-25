import mongoose from 'mongoose';

const paymentRecordSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true,
    },
    payer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    payee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    type: {
      type: String,
      enum: ['escrow_deposit', 'escrow_release', 'refund'],
      required: true,
    },
    status: {
      type: String,
      enum: ['success', 'pending', 'failed'],
      default: 'success',
    },
    referenceId: {
      type: String,
      required: true,
      unique: true,
    },
    paymentMethod: {
      type: String,
      default: 'simulated_escrow',
    },
  },
  {
    timestamps: true,
  }
);

export const PaymentRecord = mongoose.model('PaymentRecord', paymentRecordSchema);
