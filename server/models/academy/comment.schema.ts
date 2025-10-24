import mongoose from 'mongoose'

const CommentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    tutorialId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tutorial', required: true },
    content: { type: String, required: true, trim: true },
  },
  { timestamps: true }
)

export const Comment = mongoose.models.Comment || mongoose.model('Comment', CommentSchema)


