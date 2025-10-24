import { connectToDB } from '~/server/utils/mongoose'
import { LeadMeta } from '~/server/models/leadMeta/index.schema'
import { getUserFromSession } from '~/server/utils/getUserFromSessions'
export default defineEventHandler(async (event) => {
    await connectToDB()

    const user = await getUserFromSession(event)
    const ability = await defineAbilitiesForUser(user);

  // Vérifie la permission
  if (!ability.can('read', 'LeadMeta')) {
    throw createError({ statusCode: 403, statusMessage:"Vous n'avez pas la permission de faire cette action" });
  }

  const query = getQuery(event)
  const page = parseInt(query.page as string || '1')
  const limit = parseInt(query.limit as string || '10')
  const skip = (page - 1) * limit;
  const startDate = query.startDate ? new Date(query.startDate as string) : null;
  const endDate = query.endDate ? new Date(query.endDate as string) : null;
  const phonePrefix = query.phonePrefix as string || '';
  const caMin = query.caMin ? parseInt(query.caMin as string) : null;
  const caMax =query.caMax ? parseInt(query.caMax as string) : null
  const unite = query.unite as string || null  
  const search = query.search as string | undefined;
  //filtre date
  const filter: Record<string, any> = { attribution: false }
  if (startDate && endDate) {
    endDate.setHours(23, 59, 59, 999) // inclure toute la journée finale
    filter.created_time = { $gte: startDate, $lte: endDate }
  } else if (startDate) {
    filter.created_time = { $gte: startDate }
  } else if (endDate) {
    endDate.setHours(23, 59, 59, 999)
    filter.created_time = { $lte: endDate }
  }
  if (phonePrefix) {
    const prefixes = phonePrefix.toString().split(",");
    const escapedPrefixes = prefixes.map(prefix => prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    filter.phone_number = { $regex: `^(${escapedPrefixes.join("|")})`, $options: 'i' }
  }
  if (caMin !== null && caMax !== null && unite) {
    filter.ca_valeur_min = { $gte: caMin }
    filter.ca_valeur_max = { $lte: caMax }
    filter.unite = unite
  }
  if (search) {
        const regex = { $regex: search, $options: 'i' }
        const orFilters = [
            { full_name: regex},
            { nom: regex },
            { prenom: regex },
            { email: regex },
            { chiffre_affaire: regex }
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

  const total = await LeadMeta.countDocuments(filter);
  // const leads = await LeadMeta.find({ attribution: false }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean();
  const leads = await LeadMeta.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean();
  
  return {
    data: leads,
    total,   // nombre total d'éléments
    page,
    limit
  };
})
