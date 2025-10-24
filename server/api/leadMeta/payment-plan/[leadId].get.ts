import { PaymentPlan } from '~/server/models/leadMeta/paymentPlan.schema';
import { connectToDB } from '~/server/utils/mongoose';
import { getUserFromSession } from '~/server/utils/getUserFromSessions';
import { defineAbilitiesForUser } from '~/server/utils/caslAbility/defineAbilities';

export default defineEventHandler(async (event) => {
  await connectToDB();
  const user = await getUserFromSession(event);
  await defineAbilitiesForUser(user);

  const leadId = event.context.params?.leadId;
  if (!leadId) {
    throw createError({ statusCode: 400, statusMessage: 'ID du lead manquant' });
  }

  const plan = await PaymentPlan.findOne({ id_lead: leadId }).lean();

  return {
    plan,
  };
});
