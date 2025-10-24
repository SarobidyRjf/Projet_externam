import { connectToDB } from '~/server/utils/mongoose';
import { AttributionLead } from '~/server/models/leadMeta/attributionLead.schema';

export default defineEventHandler(async (event) => {
  await connectToDB();
  
    const stats = await AttributionLead.aggregate([
        {
            $group: {
                _id: "$status",
                count: { $sum: 1}
          }
      }
  ])
    return { data: stats }
});
