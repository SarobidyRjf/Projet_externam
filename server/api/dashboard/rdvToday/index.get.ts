import { connectToDB } from '~/server/utils/mongoose';
import { AttributionLead } from '~/server/models/leadMeta/attributionLead.schema';
import { getUserFromSession } from '~/server/utils/getUserFromSessions';

export default defineEventHandler(async (event) => {
  await connectToDB();

  const user = await getUserFromSession(event);
  const ability = await defineAbilitiesForUser(user);
  const hasPermission = ability.can('read', 'AttributionLead');

  if (!hasPermission) {
    throw createError({ statusCode: 403, statusMessage: "Vous n'avez pas la permission de faire cette action" });
  }

  const query = getQuery(event)
  const period = query.period as string 

  const today = new Date();
  let start: Date;
  let end: Date
  
  if (period === 'week') {
    // début de la semaine (lundi)
    start = new Date(today);
    start.setDate(today.getDate() - today.getDay() + 1);
    start.setHours(0, 0, 0, 0);

    // fin de la semaine (dimanche)
    end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);

  } else if (period === 'month') {
    // début du mois
    start = new Date(today.getFullYear(), today.getMonth(), 1);
    start.setHours(0, 0, 0, 0);

    // fin du mois
    end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    end.setHours(23, 59, 59, 999);

  } else {
    // par défaut = aujourd’hui
    start = new Date(today);
    start.setHours(0, 0, 0, 0);

    end = new Date(today);
    end.setHours(23, 59, 59, 999);
  }

  const filter: Record<string, any> = {
    date_rdv: { $gte: start, $lt: end }
  };

  if (user.role.name !== 'super_admin' && user.role.name !== 'responsable_commercial') {
    filter.assigned_to_user = user._id;
  }

  const leads = await AttributionLead.find(filter)
    .sort({ date_rdv: 1 })
    .populate('assigned_to_user', 'nom prenom')
    .lean();

  return { data: leads };
});
