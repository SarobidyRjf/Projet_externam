import mongoose from 'mongoose';

const leadHistorySchema = new mongoose.Schema({
  lead: { type: mongoose.Schema.Types.ObjectId, ref: 'AttributionLead', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true },
  meta: { type: mongoose.Schema.Types.Mixed },
}, {
  timestamps: true,
});

export const LeadHistory = mongoose.models.LeadHistory || mongoose.model('LeadHistory', leadHistorySchema);
