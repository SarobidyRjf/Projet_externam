import { createError, defineEventHandler, readMultipartFormData } from 'h3'
import mongoose from 'mongoose'
import { promises as fs } from 'fs'
import path from 'path'

import { connectToDB } from '~/server/utils/mongoose'
import { Montage } from '~/server/models/montage'

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'montage', 'scripts')

const ensureUploadDir = async () => {
  await fs.mkdir(UPLOAD_DIR, { recursive: true })
}

const bufferToString = (data: Buffer | undefined) => data ? data.toString('utf8') : ''

export default defineEventHandler(async (event) => {
  await connectToDB()

  const formData = await readMultipartFormData(event)
  if (!formData?.length) {
    throw createError({ statusCode: 400, statusMessage: 'Formulaire invalide' })
  }

  let leadId: string | undefined
  let notes = ''
  let isValidated = false
  const files: Array<{ filename: string; data: Buffer; type?: string; originalFilename: string; size: number }> = []
  const removedAttachmentIds: mongoose.Types.ObjectId[] = []

  for (const field of formData) {
    if (!field.name) {
      continue
    }

    if (field.filename) {
      files.push({
        filename: field.filename,
        data: field.data,
        type: field.type,
        originalFilename: field.filename,
        size: field.data?.length ?? 0,
      })
      continue
    }

    const value = bufferToString(field.data)

    if (field.name === 'leadId') {
      leadId = value
    } else if (field.name === 'notes') {
      notes = value ?? ''
    } else if (field.name === 'isValidated') {
      isValidated = value === 'true'
    } else if (field.name === 'removedAttachmentIds' && value && mongoose.isValidObjectId(value)) {
      removedAttachmentIds.push(new mongoose.Types.ObjectId(value))
    }
  }

  if (!leadId || !mongoose.isValidObjectId(leadId)) {
    throw createError({ statusCode: 400, statusMessage: 'Lead invalide' })
  }

  const leadObjectId = new mongoose.Types.ObjectId(leadId)

  try {
    await ensureUploadDir()

    let montageDoc = await Montage.findOne({ lead: leadObjectId })
    const filesToDelete: string[] = []

    if (montageDoc && removedAttachmentIds.length) {
      const removedIdsSet = new Set(removedAttachmentIds.map((id) => id.toString()))
      const attachments = montageDoc.script?.attachments ?? []
      attachments.forEach((attachment: any) => {
        if (removedIdsSet.has(attachment._id.toString()) && attachment.url) {
          filesToDelete.push(attachment.url)
        }
      })
    }

    const newAttachments = [] as Array<{ _id: mongoose.Types.ObjectId; fileName: string; originalName: string; mimeType?: string; size: number; url: string }>

    for (const file of files) {
      const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2)}-${file.filename}`
      const storedPath = path.join(UPLOAD_DIR, uniqueName)
      await fs.writeFile(storedPath, file.data)
      const urlPath = `/uploads/montage/scripts/${uniqueName}`
      newAttachments.push({
        _id: new mongoose.Types.ObjectId(),
        fileName: uniqueName,
        originalName: file.originalFilename,
        mimeType: file.type,
        size: file.size,
        url: urlPath,
      })
    }

    const update: Record<string, any> = {
      $set: {
        lead: leadObjectId,
        'script.notes': notes,
        'script.isValidated': isValidated,
        'script.updatedAt': new Date(),
      },
    }

    if (newAttachments.length) {
      update.$push = {
        'script.attachments': { $each: newAttachments },
      }
    }

    if (removedAttachmentIds.length) {
      update.$pull = {
        'script.attachments': { _id: { $in: removedAttachmentIds } },
      }
    }

    const montage = await Montage.findOneAndUpdate(
      { lead: leadObjectId },
      update,
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).populate('assignedMonteurs', 'nom prenom email')

    montageDoc = montage

    if (filesToDelete.length) {
      await Promise.all(filesToDelete.map(async (urlPath) => {
        const normalizedPath = urlPath.startsWith('/') ? urlPath.slice(1) : urlPath
        const absolutePath = path.join(process.cwd(), 'public', normalizedPath)
        try {
          await fs.unlink(absolutePath)
        } catch (error: any) {
          if (error?.code !== 'ENOENT') {
            console.error('Erreur lors de la suppression du fichier :', error)
          }
        }
      }))
    }

    const script = montageDoc?.script ? {
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
      updatedAt: undefined,
      attachments: [],
    }

    return {
      success: true,
      message: 'Script enregistré avec succès.',
      data: {
        _id: montageDoc?._id?.toString() ?? null,
        lead: montageDoc?.lead?.toString() ?? leadId,
        assignedMonteurs: montageDoc?.assignedMonteurs?.map((monteur: any) => ({
          _id: monteur._id.toString(),
          nom: monteur.nom,
          prenom: monteur.prenom,
          email: monteur.email,
        })) ?? [],
        script,
      },
    }
  } catch (error: any) {
    console.error('Erreur lors de la sauvegarde du script :', error)
    throw createError({ statusCode: 500, statusMessage: 'Impossible d\'enregistrer le script' })
  }
})
