import { DetailedRdv } from "~/server/models/leadMeta/detailedRdv.schema";
import mongoose from "mongoose";

export default defineEventHandler(async (event) => {
  const idLead = getRouterParam(event, "idLead");
  const query = getQuery(event);

  const checklistIndex = parseInt(query.checklistIndex as string, 10);
  const itemIndex = parseInt(query.itemIndex as string, 10);

  if (isNaN(checklistIndex) || isNaN(itemIndex)) {
    throw createError({ statusCode: 400, statusMessage: "Index invalides" });
  }

  const rdv = await DetailedRdv.findOne({
    id_lead: new mongoose.Types.ObjectId(idLead),
  });
  if (!rdv) throw createError({ statusCode: 404, statusMessage: "RDV introuvable" });

  const checklist = rdv.checklist[checklistIndex];
  if (!checklist) throw createError({ statusCode: 404, statusMessage: "Checklist introuvable" });

  const item = checklist.items[itemIndex];
  if (!item) throw createError({ statusCode: 404, statusMessage: "Item introuvable" });

  item.done = !item.done;
  await rdv.save();

  return { checklistIndex, itemIndex, done: item.done };
});
