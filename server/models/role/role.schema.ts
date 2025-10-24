import mongoose from 'mongoose';

const roleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // ex: "admin", "commercial"
  permissions: [
    {
      action: { type: String, required: true },    // ex: "read", "create", "update", "delete"
      subject: { type: String, required: true },   // ex: "Leads", "Users", "all"
      conditions: { type: Object, default: null }  // optionnel : { authorId: "${user._id}" }
    }
  ]
});

export const Role =  mongoose.models.Role || mongoose.model('Role', roleSchema);

