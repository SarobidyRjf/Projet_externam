import mongoose from 'mongoose'

const attachmentSchema = new mongoose.Schema({
  fileName: { type: String, required: true },
  originalName: { type: String },
  mimeType: { type: String },
  size: { type: Number },
  url: { type: String, required: true },
}, {
  _id: true,
  timestamps: {
    createdAt: 'uploadedAt',
    updatedAt: false,
  },
})

const scriptSchema = new mongoose.Schema({
  notes: { type: String, default: '' },
  isValidated: { type: Boolean, default: false },
  attachments: { type: [attachmentSchema], default: [] },
  updatedAt: { type: Date },
}, { _id: false })

const montageSchema = new mongoose.Schema({
  lead: { type: mongoose.Schema.Types.ObjectId, ref: 'AttributionLead', required: true, unique: true },
  assignedMonteurs: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], default: [] },
  script: { type: scriptSchema, default: () => ({}) },
}, {
  timestamps: true,
})

montageSchema.index({ lead: 1 }, { unique: true })

export const Montage = mongoose.models.Montage || mongoose.model('Montage', montageSchema)
