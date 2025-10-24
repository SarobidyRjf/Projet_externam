import { DetailedRdv } from "~/server/models/leadMeta/detailedRdv.schema"
import { getRouterParam, createError, readBody } from 'h3'


export default defineEventHandler(async (event) => {
    const idLead = getRouterParam(event, 'idLead')
    const body = await readBody(event)
    const niveau = parseInt(body.niveau_prospect, 10);

    const updatedRdv = await DetailedRdv.findOneAndUpdate(
        { id_lead: idLead },
        { $set: { niveau_prospect: niveau} },
        { new: true, upsert: true }
    )

    return updatedRdv
 })
