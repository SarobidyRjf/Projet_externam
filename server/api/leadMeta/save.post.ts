import { connectToDB } from '~/server/utils/mongoose'
import { LeadMeta } from '~/server/models/leadMeta/index.schema'
import { transformLead } from '~/server/utils/transformChamps';

export default defineEventHandler(async (event) => {
  

 try {
    // Connexion Mongo
    await connectToDB()

    const body = await readBody(event);
    const leads = body.data;

    // Si body contient un tableau de leads
    const results = [];

  for (const rawLead of leads) {
    const formatted = transformLead(rawLead);
    const updated = await LeadMeta.findOneAndUpdate(
      { id: formatted.id },
      formatted,
      { upsert: true, new: true }
    );
    results.push(updated);
  }

  return { success: true, inserted: results.length };
    
  } catch (error: any) {
    console.error('Mongo insert error:', error);
    return { success: false, error: error.message };
  }
})