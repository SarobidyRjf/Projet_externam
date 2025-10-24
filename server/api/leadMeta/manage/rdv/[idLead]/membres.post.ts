import { connectToDB } from "~/server/utils/mongoose";
import { DetailedRdv } from "~/server/models/leadMeta/detailedRdv.schema";
import { getRouterParam, readBody, createError } from 'h3'
import mongoose from "mongoose";

export default defineEventHandler(async (event) => {
    await connectToDB()
    const idLead = getRouterParam(event, 'idLead')
    const body = await readBody(event)

    if (!Array.isArray(body.membres)) {
        throw createError({ statusCode: 400, statusMessage: 'Liste de membres invalide' })
    }

    const updated = await DetailedRdv.findOneAndUpdate(
        { id_lead: new mongoose.Types.ObjectId(idLead) },
        { $set: { membres: body.membres } },
        { new: true, upsert: true }
    ).populate('membres', 'nom prenom email')

    return {
        success: true,
        data: updated
    }
})

