import { DetailedRdv } from "~/server/models/leadMeta/detailedRdv.schema";
import mongoose from "mongoose";

export default defineEventHandler(async (event) => {
  await connectToDB();
  const idLead = getRouterParam(event, "idLead");
  const checklistIndexParam = getRouterParam(event, "checklistIndex");

  const checklistIndex = parseInt(checklistIndexParam ?? "", 10);
  if (isNaN(checklistIndex)) {
    throw createError({ statusCode: 400, statusMessage: "Checklist index invalide" });
  }

  const rdv = await DetailedRdv.findOne({
    id_lead: new mongoose.Types.ObjectId(idLead),
  });
  if (!rdv) throw createError({ statusCode: 404, statusMessage: "RDV introuvable" });

  if (!rdv.checklist[checklistIndex]) {
    throw createError({ statusCode: 404, statusMessage: "Checklist introuvable" });
  }

  rdv.checklist.splice(checklistIndex, 1);
  await rdv.save();

  return { success: true };
});
