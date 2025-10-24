import mongoose from 'mongoose';

const leadMetaSchema = new mongoose.Schema({
  id: { type: String, required: true }, // id du lead Meta
  created_time: Date,
  full_name: String,
  email: String,
  phone_number: String,
  chiffre_affaire: String, 
  attribution: { type: Boolean, default: false }, // Attribution du lead
  ca_valeur_min: Number,
  ca_valeur_max: Number,
  unite: String
}, {
  timestamps: true
});

export const LeadMeta = mongoose.models.LeadMeta || mongoose.model('LeadMeta', leadMetaSchema)