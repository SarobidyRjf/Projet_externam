import { AttributionLead } from '~/server/models/leadMeta/attributionLead.schema'

export default defineEventHandler(async (event) => {
    await connectToDB()
    const user = await getUserFromSession(event)
    const ability = await defineAbilitiesForUser(user);

    // const hasPermission = [
    //     ability.can('create', 'AttributionLead'),
    //     ability.can('create', 'LeadMeta')
    // ].some(Boolean);

    // if (!hasPermission) {
    //     throw createError({ statusCode: 403, statusMessage: "Vous n'avez pas la permission de faire cette action" });    
    // }

    const body = await readBody(event);
    const leadId = body.id_lead;
    console.log(body, "ID du lead reçu");
    if (!leadId) {
        throw createError({ statusCode: 400, statusMessage: "ID du lead manquant" });
    }

    // Mettre à jour le lead
    const updatedLead = await AttributionLead.findByIdAndUpdate(
        leadId,
        { $set: body },
        { new: true }
    );
    console.log("Updated Lead:", updatedLead);

    if (!updatedLead) {
        throw createError({ statusCode: 404, statusMessage: "Lead non trouvé" });
    }

    return { message: 'Lead mis à jour avec succès', lead: updatedLead };
});