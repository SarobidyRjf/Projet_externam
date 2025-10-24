import mongoose from 'mongoose';

const paymentDetailSchema = new mongoose.Schema({
  amount: { type: Number, default: 0 },
  remaining: { type: Number, default: 0 },
  installmentNumber: { type: Number, default: 1 },
}, {
  _id: false,
});

const packCustomizationSchema = new mongoose.Schema({
  price: { type: Number, min: 0, default: null },
  videoCount: { type: Number, min: 0, default: null },
}, {
  _id: false,
});

const paymentPlanSchema = new mongoose.Schema({
  id_lead: { type: mongoose.Schema.Types.ObjectId, ref: 'AttributionLead', required: true, unique: true, index: true },
  packType: { type: String, enum: ['premium', 'visibility', 'boost'], required: true },
  videoCount: { type: Number, default: 0 },
  price: { type: Number, default: 0 },
  paymentCount: { type: Number, default: 1 },
  payments: { type: [paymentDetailSchema], default: [] },
  marketingSupportCount: { type: Number, min: 0, default: null },
  marketingSupportPriceHt: { type: Number, min: 0, default: null },
  marketingSupportPriceTtc: { type: Number, min: 0, default: null },
  customPackValues: {
    type: Map,
    of: packCustomizationSchema,
    default: () => new Map<string, { price: number | null; videoCount: number | null }>(),
  },
}, {
  timestamps: true,
});

export const PaymentPlan = mongoose.models.PaymentPlan || mongoose.model('PaymentPlan', paymentPlanSchema);
