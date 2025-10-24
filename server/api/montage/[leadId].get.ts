import { createError, defineEventHandler, getRouterParam } from 'h3'
import mongoose from 'mongoose'

import { connectToDB } from '~/server/utils/mongoose'
import { Montage } from '~/server/models/montage'

export default defineEventHandler(async (event) => {
  await connectToDB()

  const leadId = getRouterParam(event, 'leadId')

  if (!leadId || !mongoose.isValidObjectId(leadId)) {
    throw createError({ statusCode: 400, statusMessage: 'Lead invalide' })
  }

  try {
    const montageDoc = await Montage.findOne({ lead: leadId })
      .populate('assignedMonteurs', 'nom prenom email')

    if (!montageDoc) {
      return {
        success: true,
        data: {
          _id: null,
          lead: leadId,
          assignedMonteurs: [],
          script: {
            notes: '',
            isValidated: false,
            updatedAt: null,
            attachments: [],
          },
        },
      }
    }

    const script = montageDoc.script ? {
      notes: montageDoc.script.notes ?? '',
      isValidated: Boolean(montageDoc.script.isValidated),
      updatedAt: montageDoc.script.updatedAt,
      attachments: (montageDoc.script.attachments ?? []).map((attachment: any) => ({
        _id: attachment._id.toString(),
        fileName: attachment.fileName,
        originalName: attachment.originalName,
        mimeType: attachment.mimeType,
        size: attachment.size,
        url: attachment.url,
        uploadedAt: attachment.uploadedAt,
      })),
    } : {
      notes: '',
      isValidated: false,
      updatedAt: null,
      attachments: [],
    }

    return {
      success: true,
      data: {
        _id: montageDoc._id.toString(),
        lead: montageDoc.lead.toString(),
        assignedMonteurs: montageDoc.assignedMonteurs.map((monteur: any) => ({
          _id: monteur._id.toString(),
          nom: monteur.nom,
          prenom: monteur.prenom,
          email: monteur.email,
        })),
        script,
      },
    }
  } catch (error: any) {
    console.error('Erreur lors de la récupération du montage :', error)
    throw createError({ statusCode: 500, statusMessage: 'Impossible de récupérer le montage' })
  }
})
