import mongoose from 'mongoose'

const transactionSchema = new mongoose.Schema({
  lead: { type: mongoose.Schema.Types.ObjectId, ref: 'AttributionLead', required: true },
  type: { type: String, enum: ['Paiement', 'Devis'], required: true }
}, {
  timestamps: true
})

export const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema)

