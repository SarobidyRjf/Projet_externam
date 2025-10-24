import mongoose from 'mongoose'

const TutorialSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    type: { type: String, enum: ['video', 'pdf'], required: true },
    fileUrl: { type: String, required: true },
    thumbnailUrl: { type: String, default: '' },
    durationMinutes: { type: Number, default: 0 },
    tags: { type: [String], default: [] },
    published: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
)

export const Tutorial = mongoose.models.Tutorial || mongoose.model('Tutorial', TutorialSchema)


