import { connectToDB } from '~/server/utils/mongoose'
import { AttributionLead } from '~/server/models/leadMeta/attributionLead.schema'
import { DetailedRdv } from '~/server/models/leadMeta/detailedRdv.schema'
import { getUserFromSession } from '~/server/utils/getUserFromSessions'

export default defineEventHandler(async (event) => {
    await connectToDB()
    const user = await getUserFromSession(event)
    const ability = await defineAbilitiesForUser(user);

    const hasPermission = [
        ability.can('read', 'AttributionLead'),
        ability.can('read', 'LeadMeta')
    ].some(Boolean);

    if (!hasPermission) {
        throw createError({ statusCode: 403, statusMessage: "Vous n'avez pas la permission de faire cette action" });    
    }
    
    const query = getQuery(event)
    const page = parseInt(query.page as string || '1')
    const limit = parseInt(query.limit as string || '10')
    const skip = (page - 1) * limit;
    const status = query.status as string | string[] | undefined;
    const search = query.search as string | undefined;
    const caMin = query.caMin ? parseInt(query.caMin as string) : null;
    const caMax = query.caMax ? parseInt(query.caMax as string) : null;
    const unite = query.unite as string | null;
    const prospectLevel = query.prospectLevel ? parseInt(query.prospectLevel as string) : null;
    const departmentCode = query.departmentCode as string | undefined;
    const regionCode = query.regionCode as string | undefined;

    const filter: Record<string, any> = {}
    if (user.role.name !== 'super_admin') {
        filter.assigned_to_user = user._id;
    }
    if (status) {
        filter.status = status
        console.log(filter.status)
    }
    if (search) {
        const regex = { $regex: search, $options: 'i' }
        const orFilters = [
            { full_name: regex},
            { nom: regex },
            { prenom: regex },
            { email: regex },
            { phone_number: regex }
        ]

        const phoneFilters = [{ phone_number: regex }]

        const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        const digitsOnlySearch = search.replace(/\D/g, '')

        if (digitsOnlySearch.startsWith('0')) {
            const withoutLeadingZero = digitsOnlySearch.replace(/^0+/, '')

            if (withoutLeadingZero) {
                const escapedDigits = escapeRegExp(withoutLeadingZero)
                phoneFilters.push({ phone_number: { $regex: `^\\+33${escapedDigits}`, $options: 'i' } })

                if (digitsOnlySearch.startsWith('03')) {
                    phoneFilters.push({ phone_number: { $regex: `^\\+261${escapedDigits}`, $options: 'i' } })
                }
            }
        }

        filter.$or = [...orFilters, ...phoneFilters]
    }
    if (caMin !== null && caMax !== null && unite) {
        filter.ca_valeur_min = { $gte: caMin }
        filter.ca_valeur_max = { $lte: caMax }
        filter.unite = unite
    }
    if (prospectLevel !== null && !isNaN(prospectLevel)) {
        const ids = await DetailedRdv.find({ niveau_prospect: prospectLevel }).distinct('id_lead');
        filter._id = { $in: ids };
    }
    if (departmentCode) {
        filter.citycode = { $regex: `^${departmentCode}` };
    } else if (regionCode) {
        try {
            const deps: { code: string }[] = await $fetch(`https://geo.api.gouv.fr/regions/${regionCode}/departements`);
            const codes = deps.map(d => d.code).join('|');
            filter.citycode = { $regex: `^(${codes})` };
        } catch (err) {
            console.error(err);
        }
    }

    const userId = event.context.params?.userId;
    const leadManageByUser = await AttributionLead.find(filter)
        .sort({ updatedAt: -1, createdAt: -1, })
        .populate('assigned_to_user', 'nom prenom')
        .populate('detailrdv', 'membres checklist date_rdv_rappel niveau_prospect')
        .populate('paymentPlan')
        .skip(skip)
        .limit(limit)
        .lean();
    const total = await AttributionLead.countDocuments(filter);

    return {
        data: leadManageByUser,
        total,
        page,
        limit
    }
})
