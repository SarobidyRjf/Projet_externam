import { connectToDB } from '~/server/utils/mongoose'
import { AttributionLead } from '~/server/models/leadMeta/attributionLead.schema'
import { LeadMeta } from '~/server/models/leadMeta/index.schema'
import { getUserFromSession } from '~/server/utils/getUserFromSessions'
import mongoose from 'mongoose'
import { Notification } from '~/server/models/notification/notification.schema'
import { LeadAssignedStat } from '~/server/models/leadMeta/leadAssignedStat.schema'
export default defineEventHandler(async (event) => {
    await connectToDB()

    const user = await getUserFromSession(event)
    const ability = await defineAbilitiesForUser(user);

    interface IncomingLead {
        id_lead: string;
        created_time: Date | string;
        full_name: string;
        email: string;
        phone_number: string;
        chiffre_affaire?: string;
        ca_valeur_min?: number;
        ca_valeur_max?: number;
        unite?: string;
    }

    try {
        const body = await readBody<{ leads: IncomingLead[]; user_id: string; }>(event);
        console.log('BODY:', body);
        if (!Array.isArray(body.leads) || body.leads.length === 0) {
            throw createError({ statusCode: 400, statusMessage: 'Leads manquants ou invalides.' })
        }
        if (!body.user_id) {
            throw createError({ statusCode: 400, statusMessage: 'Utilisateur invalide ou manquant. Veuillez choisir un utilisateur valide.' });
        }

        for (const lead of body.leads) {
        if (
            !lead.id_lead ||
            !lead.full_name ||
            !lead.email ||
            !lead.phone_number ||
            !lead.created_time
        ) {
            throw createError({
            statusCode: 400,
            statusMessage: 'Un ou plusieurs champs du lead sont manquants ou invalides.'
            })
        }
        }
        
        const toInsert = body.leads.map(lead => ({
            id_lead: lead.id_lead,
            created_time: lead.created_time,
            full_name: lead.full_name,
            email: lead.email,
            phone_number: lead.phone_number,
            chiffre_affaire: lead.chiffre_affaire,
            ca_valeur_min: lead.ca_valeur_min,
            ca_valeur_max: lead.ca_valeur_max,
            unite: lead.unite,
            assigned_to_user: [new mongoose.Types.ObjectId(body.user_id)],
            attribution: true,
            status: 'Nouveau lead',
            statuses: [
                {
                    name: 'Nouveau lead',
                    date: new Date()
                }
            ]
        }));

        await AttributionLead.insertMany(toInsert);
        const bulkUpdate = body.leads.map(lead => ({
            updateOne: {
                filter: { _id: new mongoose.Types.ObjectId(lead.id_lead) },
                update: { $set: { attribution: true } },
            }
        }));
        await LeadMeta.bulkWrite(bulkUpdate);

        const day = new Date();
        day.setHours(0, 0, 0, 0);
        await LeadAssignedStat.updateOne(
            { user: body.user_id, date: day },
            { $inc: { count: toInsert.length } },
            { upsert: true }
        );

        const notification = await Notification.create({
            user: body.user_id,
            type: 'attributionLead',
            payload: {
                message: `Le responsable vous a attribué ${toInsert.length} leads`,
                leadIds: toInsert.map((lead) => lead.id_lead),
            },
        });

        const io = event.context.io as import("socket.io").Server;
        io?.to(body.user_id).emit("notification", notification.toObject());

        return {
            message: `${toInsert.length} leads attribués à l'utilisateur avec succès.`,
            success: true
        };
    } catch (err: any) {
        console.error(err);
        if (err.statusCode) {
            throw err;
        }
    }
    
})