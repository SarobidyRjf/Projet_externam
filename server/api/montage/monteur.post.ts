import { createError, defineEventHandler, readBody } from 'h3'
import mongoose from 'mongoose'

import { connectToDB } from '~/server/utils/mongoose'
import { AttributionLead } from '~/server/models/leadMeta/attributionLead.schema'
import { Montage } from '~/server/models/montage'

export default defineEventHandler(async (event) => {
  await connectToDB()

  const body = await readBody<{ leadId?: string; monteurIds?: string[] }>(event)
  const leadId = body?.leadId
  const monteurIds = Array.isArray(body?.monteurIds) ? body.monteurIds : []

  if (!leadId || typeof leadId !== 'string' || !mongoose.isValidObjectId(leadId)) {
    throw createError({ statusCode: 400, statusMessage: 'Lead invalide' })
  }

  const leadObjectId = new mongoose.Types.ObjectId(leadId)
  const validMonteurIds = monteurIds
    .filter((id): id is string => typeof id === 'string' && mongoose.isValidObjectId(id))
    .map((id) => new mongoose.Types.ObjectId(id))

  try {
    const [existingLead, existingMontage] = await Promise.all([
      AttributionLead.findById(leadObjectId).select('assigned_to_user').lean(),
      Montage.findOne({ lead: leadObjectId }).select('assignedMonteurs').lean(),
    ])

    const previousMontageIds = new Set(
      ((existingMontage?.assignedMonteurs ?? []) as mongoose.Types.ObjectId[])
        .map((id) => (typeof id === 'string' ? id : id?.toString?.()))
        .filter((id): id is string => Boolean(id))
    )

    const baseAssignedIds = ((existingLead?.assigned_to_user ?? []) as mongoose.Types.ObjectId[])
      .map((id) => (typeof id === 'string' ? id : id?.toString?.()))
      .filter((id): id is string => Boolean(id) && !previousMontageIds.has(id))

    const finalAssignedIds = Array.from(
      new Set([
        ...baseAssignedIds,
        ...validMonteurIds.map((id) => id.toString()),
      ])
    )
      .filter((id) => mongoose.isValidObjectId(id))
      .map((id) => new mongoose.Types.ObjectId(id))

    const updatedLead = await AttributionLead.findByIdAndUpdate(
      leadObjectId,
      { assigned_to_user: finalAssignedIds },
      { new: true }
    ).populate('assigned_to_user', 'nom prenom email')

    const montage = await Montage.findOneAndUpdate(
      { lead: leadObjectId },
      {
        $set: {
          lead: leadObjectId,
          assignedMonteurs: validMonteurIds,
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).populate('assignedMonteurs', 'nom prenom email')

    const assignedMonteurs = montage
      ? montage.assignedMonteurs.map((monteur: any) => ({
          _id: monteur._id.toString(),
          nom: monteur.nom,
          prenom: monteur.prenom,
          email: monteur.email,
        }))
      : []

    return {
      success: true,
      message: 'Informations monteur enregistrées avec succès.',
      data: {
        assignedMonteurs,
        lead: updatedLead ? {
          ...updatedLead.toObject(),
          _id: updatedLead._id.toString(),
        } : null,
      },
    }
  } catch (error: any) {
    console.error('Erreur lors de la sauvegarde du monteur :', error)
    throw createError({ statusCode: 500, statusMessage: 'Impossible d\'enregistrer les informations monteur' })
  }
})
