import { connectToDB } from '~/server/utils/mongoose';
import { AttributionLead } from '~/server/models/leadMeta/attributionLead.schema';
import { LeadHistory } from '~/server/models/leadMeta/history.schema';

export default defineEventHandler(async () => {
  await connectToDB();

  // Leads marked for attribution (to be processed)
  const totalToProcess = await AttributionLead.countDocuments({ attribution: true });

  // Leads with at least one history entry (assumed called)
  const calledLeadIds = await LeadHistory.distinct('lead');

  // Leads to process that have never been called
  const neverCalled = await AttributionLead.countDocuments({
    attribution: true,
    _id: { $nin: calledLeadIds }
  });

  const stats = [
    { _id: 'Leads à traiter', count: totalToProcess },
    { _id: 'Leads jamais appelés', count: neverCalled }
  ];

  return { data: stats };
});
