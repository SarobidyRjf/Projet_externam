import { DetailedRdv } from "~/server/models/leadMeta/detailedRdv.schema"

export default defineEventHandler(async (event) => {
    const idLead = event.context.params?.idLead
    try {
        const detailrdv = await DetailedRdv.findOne({ id_lead: idLead })
            .populate('membres', 'nom prenom email')
        return detailrdv

    } catch (error) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Erreur lors de la recherche de RDV'
        })
    
    }
})