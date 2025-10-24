import mongoose from 'mongoose'

const ActivitySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    tutorialId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tutorial', required: true },
    type: { type: String, enum: ['view','download','like','love','comment'], required: true },
    content: { type: String, default: '' }
  },
  { timestamps: true }
)

export const Activity = mongoose.models.Activity || mongoose.model('Activity', ActivitySchema)


