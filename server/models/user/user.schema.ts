import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  matricule: { type: String, required: true, unique: true },
  nom: { type: String, required: true },
  prenom: { type: String, required: true },
  role: { type: mongoose.Schema.Types.ObjectId, ref: 'Role' },
  metier: { type: String, default: 'user' },
  avatar: { type: String, default: '' },
}, {
  timestamps: true
});

export const User = mongoose.models.User || mongoose.model('User', userSchema);