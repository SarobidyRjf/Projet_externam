import { connectToDB } from '~/server/utils/mongoose';
import { AttributionLead } from '~/server/models/leadMeta/attributionLead.schema';
import { getUserFromSession } from '~/server/utils/getUserFromSessions';
import { defineAbilitiesForUser } from '~/server/utils/caslAbility/defineAbilities';

export default defineEventHandler(async (event) => {
  await connectToDB();

  const user = await getUserFromSession(event);
  const ability = await defineAbilitiesForUser(user);

  // const hasPermission = [
  //   ability.can('read', 'AttributionLead'),
  //   ability.can('read', 'LeadMeta'),
  // ].some(Boolean);

  // if (!hasPermission) {
  //   throw createError({
  //     statusCode: 403,
  //     statusMessage: "Vous n'avez pas la permission de faire cette action",
  //   });
  // }

  const query = getQuery(event);
  const page = Math.max(parseInt((query.page as string) || '1', 10), 1);
  const limit = Math.min(Math.max(parseInt((query.limit as string) || '20', 10), 1), 100);
  const skip = (page - 1) * limit;
  const search = (query.search as string | undefined)?.trim();

  const filter: Record<string, any> = {
    assigned_to_user: user._id,
  };

  if (search) {
    const regex = { $regex: search, $options: 'i' };
    const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const digitsOnlySearch = search.replace(/\D/g, '');

    const orFilters: Record<string, unknown>[] = [
      { full_name: regex },
      { nom: regex },
      { prenom: regex },
      { email: regex },
      { phone_number: regex },
      { nom_societe: regex },
    ];

    const phoneFilters: Record<string, unknown>[] = [];

    if (digitsOnlySearch) {
      phoneFilters.push({ phone_number: { $regex: escapeRegExp(digitsOnlySearch), $options: 'i' } });

      if (digitsOnlySearch.startsWith('0')) {
        const withoutLeadingZero = digitsOnlySearch.replace(/^0+/, '');
        if (withoutLeadingZero) {
          const escapedDigits = escapeRegExp(withoutLeadingZero);
          phoneFilters.push({ phone_number: { $regex: `^\\+33${escapedDigits}`, $options: 'i' } });
          phoneFilters.push({ phone_number: { $regex: `^\\+261${escapedDigits}`, $options: 'i' } });
        }
      }
    }

    filter.$or = [...orFilters, ...phoneFilters];
  }

  const leadsQuery = AttributionLead.find(filter)
    .sort({ updatedAt: -1, createdAt: -1 })
    .populate('assigned_to_user', 'nom prenom')
    .skip(skip)
    .limit(limit)
    .lean();

  const [leads, total] = await Promise.all([
    leadsQuery,
    AttributionLead.countDocuments(filter),
  ]);

  return {
    data: leads,
    total,
    page,
    limit,
  };
});
