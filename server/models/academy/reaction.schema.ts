import mongoose from 'mongoose'

const ReactionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    tutorialId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tutorial', required: true },
    type: { type: String, enum: ['like','love'], required: true }
  },
  { timestamps: true, indexes: [{ unique: true, fields: { userId: 1, tutorialId: 1, type: 1 } }] }
)

ReactionSchema.index({ userId: 1, tutorialId: 1, type: 1 }, { unique: true })

export const Reaction = mongoose.models.Reaction || mongoose.model('Reaction', ReactionSchema)


