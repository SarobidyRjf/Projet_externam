import { DetailedRdv } from "~/server/models/leadMeta/detailedRdv.schema";
import mongoose from "mongoose";


export default defineEventHandler(async (event) => {
  const idLead = getRouterParam(event, 'idLead')
  const checklistIndexParam = getRouterParam(event, 'checklistIndex')

  if (!checklistIndexParam) {
    throw createError({ statusCode: 400, statusMessage: 'Checklist index manquant' })
  }

  const checklistIndex = parseInt(checklistIndexParam, 10)
  if (isNaN(checklistIndex)) {
    throw createError({ statusCode: 400, statusMessage: 'Checklist index invalide' })
  }
    
    
  const body = await readBody(event)

  if (!body.label) throw createError({ statusCode: 400, statusMessage: 'Label manquant' })

  const rdv = await DetailedRdv.findOne({ id_lead: new mongoose.Types.ObjectId(idLead) })
  if (!rdv) throw createError({ statusCode: 404, statusMessage: 'RDV introuvable' })

  if (!rdv.checklist[checklistIndex]) throw createError({ statusCode: 404, statusMessage: 'Checklist introuvable' })

  rdv.checklist[checklistIndex].items.push({ label: body.label })
  await rdv.save()

  return rdv
})
