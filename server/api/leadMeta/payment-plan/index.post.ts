import { PaymentPlan } from '~/server/models/leadMeta/paymentPlan.schema';
import { connectToDB } from '~/server/utils/mongoose';
import { getUserFromSession } from '~/server/utils/getUserFromSessions';
import { defineAbilitiesForUser } from '~/server/utils/caslAbility/defineAbilities';

const ALLOWED_PACK_TYPES = new Set(['premium', 'visibility', 'boost']);

const sanitizePrice = (value: unknown) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return null;
  }
  return parsed;
};

const sanitizeVideoCount = (value: unknown) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return null;
  }
  return Math.round(parsed);
};

const sanitizeInstallmentNumber = (value: unknown) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return null;
  }
  return Math.round(parsed);
};

export default defineEventHandler(async (event) => {
  await connectToDB();
  const user = await getUserFromSession(event);
  await defineAbilitiesForUser(user);

  const body = await readBody(event);
  const leadId = body.id_lead as string | undefined;
  if (!leadId) {
    throw createError({ statusCode: 400, statusMessage: 'ID du lead manquant' });
  }

  const packTypeInput = typeof body.packType === 'string' ? body.packType : 'premium';
  const packType = ALLOWED_PACK_TYPES.has(packTypeInput) ? packTypeInput : 'premium';
  const videoCount = Number.isFinite(Number(body.videoCount)) ? Math.max(0, Math.round(Number(body.videoCount))) : 0;
  const price = sanitizePrice(body.price) ?? 0;
  const requestedPaymentCount = Number.isFinite(Number(body.paymentCount)) ? Math.max(1, Math.round(Number(body.paymentCount))) : 1;

  const paymentsInput = Array.isArray(body.payments) ? body.payments : [];
  const payments = paymentsInput.slice(0, requestedPaymentCount).map((payment: any, index: number) => ({
    amount: Number.isFinite(Number(payment?.amount)) ? Number(payment.amount) : 0,
    remaining: Number.isFinite(Number(payment?.remaining)) ? Number(payment.remaining) : 0,
    installmentNumber: sanitizeInstallmentNumber(payment?.installmentNumber) ?? index + 1,
  }));

  while (payments.length < requestedPaymentCount) {
    payments.push({ amount: 0, remaining: 0, installmentNumber: payments.length + 1 });
  }

  const marketingSupportCount = sanitizeVideoCount(body.marketingSupportCount);
  const marketingSupportPriceHt = sanitizePrice(body.marketingSupportPriceHt);
  const marketingSupportPriceTtc = sanitizePrice(body.marketingSupportPriceTtc);

  const customPackValuesInput = (typeof body.customPackValues === 'object' && body.customPackValues !== null
    ? body.customPackValues
    : {}) as Record<string, { price?: unknown; videoCount?: unknown }>;
  const customPackValues = Array.from(ALLOWED_PACK_TYPES.values()).reduce<Record<string, { price: number | null; videoCount: number | null }>>(
    (acc, pack) => {
      const packInput = customPackValuesInput?.[pack];
      acc[pack] = {
        price: sanitizePrice(packInput?.price),
        videoCount: sanitizeVideoCount(packInput?.videoCount),
      };
      return acc;
    },
    {},
  );

  const plan = await PaymentPlan.findOneAndUpdate(
    { id_lead: leadId },
    {
      $set: {
        id_lead: leadId,
        packType,
        videoCount,
        price,
        paymentCount: requestedPaymentCount,
        payments,
        customPackValues,
        marketingSupportCount,
        marketingSupportPriceHt,
        marketingSupportPriceTtc,
      },
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    },
  );

  return {
    message: 'Plan de paiement enregistré avec succès',
    plan,
  };
});
