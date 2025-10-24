import { connectToDB } from "~/server/utils/mongoose";
import { DetailedRdv } from "~/server/models/leadMeta/detailedRdv.schema";
import { getUserFromSession } from '~/server/utils/getUserFromSessions'
import { getRouterParam, createError, readBody } from 'h3'
import mongoose from "mongoose";

export default defineEventHandler(async (event) => {
    await connectToDB()
    const body = await readBody(event)

    const idLead = getRouterParam(event, 'idLead')
    if (!body.date_rdv_rappel) {
        throw createError({ statusCode: 400, statusMessage: 'Date manquante' })
    }

    const rawReminders = Array.isArray(body.reminders)
        ? body.reminders
        : (typeof body.reminder !== 'undefined' ? [body.reminder] : [])

    const sanitizedReminders = [...new Set(rawReminders
        .map((value: number | string) => Number(value))
        .filter((value: number) => Number.isFinite(value) && value >= 0))]
        .sort((a, b) => a - b)

    const [primaryReminder = 0] = sanitizedReminders

    const updated = await DetailedRdv.findOneAndUpdate(
        { id_lead: new mongoose.Types.ObjectId(idLead) },
        {
            $set: {
                date_rdv_rappel: new Date(body.date_rdv_rappel),
                reminders: sanitizedReminders,
                reminder: primaryReminder,
                date_rappel_effective : body.date_rappel_effective ? new Date(body.date_rappel_effective) : null,
                reminder_sent : body.reminder_sent || false
            }
        },
        { new: true, upsert: true }
    )

    return {
        success: true,
        data: updated
    }
})