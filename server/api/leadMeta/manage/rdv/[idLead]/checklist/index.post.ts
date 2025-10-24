import { DetailedRdv } from "~/server/models/leadMeta/detailedRdv.schema";
import mongoose from "mongoose"


export default defineEventHandler(async (event) => {
    await connectToDB()
    const body = await readBody(event)
    const idLead = getRouterParam(event, 'idLead')
    
    const updated = await DetailedRdv.findOneAndUpdate(
        { id_lead: new mongoose.Types.ObjectId(idLead) },
        { $push: {checklist: {title: body.title, items: []}} },
        { new: true, upsert: true }
    )
    return {
        success: true,
        data: updated
    }
})