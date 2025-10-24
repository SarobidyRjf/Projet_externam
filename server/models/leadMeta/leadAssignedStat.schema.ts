import mongoose from 'mongoose';

const leadAssignedStatSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  count: { type: Number, default: 0 }
}, {
  timestamps: true
});

leadAssignedStatSchema.index({ user: 1, date: 1 }, { unique: true });

export const LeadAssignedStat = mongoose.models.LeadAssignedStat || mongoose.model('LeadAssignedStat', leadAssignedStatSchema)
