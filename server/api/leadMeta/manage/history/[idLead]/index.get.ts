import { connectToDB } from '~/server/utils/mongoose';
import { LeadHistory } from '~/server/models/leadMeta/history.schema';
import { getRouterParam } from 'h3';
import mongoose from 'mongoose';

export default defineEventHandler(async (event) => {
  await connectToDB();
  const idLead = getRouterParam(event, 'idLead');
  const history = await LeadHistory
    .find({ lead: new mongoose.Types.ObjectId(idLead) })
    .sort({ createdAt: -1 })
    .populate('user', 'nom prenom');
  return history;
});
