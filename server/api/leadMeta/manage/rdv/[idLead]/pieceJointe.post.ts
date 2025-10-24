import { connectToDB } from "~/server/utils/mongoose";
import { DetailedRdv } from "~/server/models/leadMeta/detailedRdv.schema";
import { getRouterParam, readMultipartFormData, createError, getQuery } from 'h3'
import { promises as fs } from 'fs'
import path from 'path'
import mongoose from 'mongoose'

export default defineEventHandler(async (event) => {
    await connectToDB()
    const idLead = getRouterParam(event, 'idLead')
    const { category, docType } = getQuery(event)
    const formData = await readMultipartFormData(event)
    const file = formData?.find(field => field.name === 'file')

    if (!file) {
        throw createError({ statusCode: 400, statusMessage: 'Fichier manquant' })
    }
    if (!category || typeof category !== 'string') {
        throw createError({ statusCode: 400, statusMessage: 'Catégorie manquante' })
    }

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    await fs.mkdir(uploadsDir, { recursive: true })

    const fileName = `${Date.now()}-${file.filename}`
    await fs.writeFile(path.join(uploadsDir, fileName), file.data)
    const filePath = `/uploads/${fileName}`

    let update: any = {}

    if (category === 'docs_societe') {
        if (!docType || typeof docType !== 'string') {
            throw createError({ statusCode: 400, statusMessage: 'Type de document manquant' })
        }
        update = { $set: { [`piece_jointe.docs_societe.${docType}`]: filePath } }
    } else if (category === 'contrat' || category === 'facture' || category === 'autre') {
       update = { $addToSet: { [`piece_jointe.${category}`]: filePath } }
    } else {
        throw createError({ statusCode: 400, statusMessage: 'Catégorie invalide' })
    }

    const updated = await DetailedRdv.findOneAndUpdate(
        { id_lead: new mongoose.Types.ObjectId(idLead) },
        update,
        { new: true, upsert: true }
    )

    return {
        success: true,
        data: updated
    }
})
