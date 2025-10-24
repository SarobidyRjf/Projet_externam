import { connectToDB } from '~/server/utils/mongoose';
import { LeadHistory } from '~/server/models/leadMeta/history.schema';
import { getUserFromSession } from '~/server/utils/getUserFromSessions';
import { getRouterParam, readBody, createError } from 'h3';
import mongoose from 'mongoose';

export default defineEventHandler( async (event) => {
  await connectToDB();
  const user = await getUserFromSession(event);
  const idLead = getRouterParam(event, 'idLead');
  const body = await readBody(event);
  if(!body.action){
    throw createError({ statusCode: 400, statusMessage: 'Action manquante' });
  }
  const history = await LeadHistory.create({
    lead: new mongoose.Types.ObjectId(idLead),
    user: user._id,
    action: body.action,
    meta: body.meta || {},
  });
  await history.populate('user', 'nom prenom')
  return history;
});
