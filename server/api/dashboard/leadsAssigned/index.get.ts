import { connectToDB } from '~/server/utils/mongoose';
import { LeadAssignedStat } from '~/server/models/leadMeta/leadAssignedStat.schema';

export default defineEventHandler(async (event) => {
  await connectToDB();

  const { period = 'week', year, month } = getQuery(event);
  const now = new Date();
  let start: Date; let end: Date;

  if (period === 'year') {
    const y = Number(year ?? now.getFullYear());
    start = new Date(y, 0, 1);
    end = new Date(y + 1, 0, 1);
  } else if (period === 'month') {
    const y = Number(year ?? now.getFullYear());
    const m = Number(month ?? now.getMonth() + 1);
    start = new Date(y, m - 1, 1);
    end = new Date(y, m, 1);
  } else {
    const current = new Date(now);
    const day = current.getDay();
    const diff = (day === 0 ? -6 : 1) - day;
    start = new Date(current);
    start.setDate(current.getDate() + diff);
    start.setHours(0, 0, 0, 0);
    end = new Date(start);
    end.setDate(start.getDate() + 7);
  }

  const statsDocs = await LeadAssignedStat.find({ date: { $gte: start, $lt: end } })
    .populate('user', 'nom prenom');

  const map = new Map<string, { period: number; count: number; user: { _id: string; nom: string; prenom: string } }>();

  for (const doc of statsDocs) {
    const d = doc.date as Date;
    const periodVal = period === 'year'
      ? d.getMonth() + 1
      : period === 'month'
        ? d.getDate()
        : (d.getDay() === 0 ? 7 : d.getDay());
    const key = `${doc.user._id}-${periodVal}`;
    const existing = map.get(key);
    const count = (existing?.count || 0) + doc.count;
    map.set(key, { period: periodVal, count, user: doc.user as any });
  }

  const stats = Array.from(map.values()).sort((a, b) => a.period - b.period);

  return { data: stats };
});
