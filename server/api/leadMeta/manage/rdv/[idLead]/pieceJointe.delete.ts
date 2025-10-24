import { DetailedRdv } from "~/server/models/leadMeta/detailedRdv.schema";
import { connectToDB } from "~/server/utils/mongoose";
import { promises as fs } from "fs";
import path from "path";
import mongoose from "mongoose";
import { getRouterParam, getQuery, createError } from "h3";

export default defineEventHandler(async (event) => {
  await connectToDB();
  const idLead = getRouterParam(event, "idLead");
  const { category, docType, index } = getQuery(event);

  if (!category || typeof category !== "string") {
    throw createError({ statusCode: 400, statusMessage: "Catégorie manquante" });
  }

  const rdv = await DetailedRdv.findOne({
    id_lead: new mongoose.Types.ObjectId(idLead),
  });

  if (!rdv || !rdv.piece_jointe) {
    throw createError({ statusCode: 404, statusMessage: "Pièce jointe introuvable" });
  }

  let storedPath: string | undefined;
  let update: any = {};

  if (category === "docs_societe") {
    if (!docType || typeof docType !== "string") {
      throw createError({ statusCode: 400, statusMessage: "Type de document manquant" });
    }
    storedPath = (rdv.piece_jointe as any)?.docs_societe?.[docType];
    if (!storedPath) {
      throw createError({ statusCode: 404, statusMessage: "Pièce jointe introuvable" });
    }
    update = { $unset: { [`piece_jointe.docs_societe.${docType}`]: "" } };
  } else if (category === "contrat" || category === "facture" || category === "autre") {
    const idx = typeof index === "string" ? parseInt(index) : NaN;
    if (isNaN(idx)) {
      throw createError({ statusCode: 400, statusMessage: "Index manquant" });
    }
    storedPath = (rdv.piece_jointe as any)?.[category]?.[idx];
    if (!storedPath) {
      throw createError({ statusCode: 404, statusMessage: "Pièce jointe introuvable" });
    }
    update = { $pull: { [`piece_jointe.${category}`]: storedPath } };
  } else {
    throw createError({ statusCode: 400, statusMessage: "Catégorie invalide" });
  }

  const filePath = path.join(
    process.cwd(),
    "public",
    storedPath.startsWith("/") ? storedPath.slice(1) : storedPath
  );

  try {
    await fs.unlink(filePath);
  } catch (err) {
    console.error(err);
  }

  await DetailedRdv.updateOne(
    { id_lead: new mongoose.Types.ObjectId(idLead) },
    update
  );

  return { success: true };
});

