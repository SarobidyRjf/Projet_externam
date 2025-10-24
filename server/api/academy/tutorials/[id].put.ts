import { defineEventHandler, createError, getHeader } from 'h3'
import { getRouterParam } from 'h3'
import path from 'path'
import { promises as fs } from 'fs'
import mongoose from 'mongoose'
import { connectToDB } from '~/server/utils/mongoose'
import { getUserFromSession } from '~/server/utils/getUserFromSessions'
import { defineAbilitiesForUser } from '~/server/utils/caslAbility/defineAbilities'
import { Tutorial } from '~/server/models/academy/tutorial.schema'
import Busboy from 'busboy'

const ensureDir = async (dir: string) => {
  await fs.mkdir(dir, { recursive: true })
}

export default defineEventHandler(async (event) => {
  await connectToDB()

  const id = getRouterParam(event, 'id')
  if (!id || !mongoose.isValidObjectId(id)) {
    throw createError({ statusCode: 400, statusMessage: 'ID invalide' })
  }

  const user = await getUserFromSession(event)
  const ability = await defineAbilitiesForUser(user as any)
  if (!ability.can('update', 'Tutorial') && !ability.can('manage', 'all')) {
    throw createError({ statusCode: 403, statusMessage: 'Accès refusé' })
  }

  // Lecture STREAMING via Busboy pour supporter les très gros fichiers
  const contentType = getHeader(event, 'content-type') || ''
  if (!contentType.includes('multipart/form-data')) {
    throw createError({ statusCode: 400, statusMessage: 'Type de contenu invalide' })
  }

  const update: any = {}
  let fileTmpPath: string | undefined
  let fileName: string | undefined
  let typeForPath: 'video' | 'pdf' | undefined
  let thumbTmpPath: string | undefined
  let thumbnailName: string | undefined

  // Dossiers de destination
  const baseDir = path.join(process.cwd(), 'public', 'uploads', 'academy')
  const videoDir = path.join(baseDir, 'videos')
  const pdfDir = path.join(baseDir, 'pdfs')
  const thumbDir = path.join(baseDir, 'thumbnails')
  await ensureDir(videoDir)
  await ensureDir(pdfDir)
  await ensureDir(thumbDir)

  const busboy = Busboy({ headers: { 'content-type': contentType }, limits: { fileSize: 4 * 1024 * 1024 * 1024 } })

  const parsing = new Promise<void>((resolve, reject) => {
    busboy.on('file', async (fieldname, file, filename, encoding, mimetype) => {
      const unique = `${Date.now()}-${Math.random().toString(36).slice(2)}`
      if (fieldname === 'file') {
        fileName = filename
        const tmp = path.join(baseDir, `${unique}-${filename}.uploading`)
        fileTmpPath = tmp
        const write = (await import('node:fs')).createWriteStream(tmp)
        file.pipe(write)
        write.on('error', reject)
      } else if (fieldname === 'thumbnail') {
        thumbnailName = filename
        const tmp = path.join(baseDir, `${unique}-${filename}.thumb`)
        thumbTmpPath = tmp
        const write = (await import('node:fs')).createWriteStream(tmp)
        file.pipe(write)
        write.on('error', reject)
      } else {
        // fichier inattendu
        file.resume()
      }
    })
    busboy.on('field', (name, val) => {
      const value = String(val ?? '')
      if (name === 'title') update.title = value.trim()
      else if (name === 'description') update.description = value
      else if (name === 'type') {
        update.type = value === 'pdf' ? 'pdf' : 'video'
        typeForPath = update.type
      }
      else if (name === 'tags') update.tags = value.split(',').map(t => t.trim()).filter(Boolean)
      else if (name === 'published') update.published = value === 'true' || value === '1'
      else if (name === 'durationMinutes') update.durationMinutes = Number(value) || 0
    })
    busboy.on('error', reject)
    busboy.on('finish', () => resolve())
    ;(event.node.req as any).pipe(busboy)
  })

  await parsing

  if (fileTmpPath && fileName) {
    const t = typeForPath || (update.type as 'video' | 'pdf') || 'video'
    const typeDir = path.join(baseDir, t === 'pdf' ? 'pdfs' : 'videos')
    const uniqueOut = `${Date.now()}-${Math.random().toString(36).slice(2)}`
    const storedFileName = `${uniqueOut}-${fileName}`
    const storedFilePath = path.join(typeDir, storedFileName)
    // Déplace le fichier temporaire vers le dossier final (rename est atomique et rapide)
    await fs.rename(fileTmpPath, storedFilePath)
    update.fileUrl = `/uploads/academy/${t === 'pdf' ? 'pdfs' : 'videos'}/${storedFileName}`
  }

  if (thumbTmpPath && thumbnailName) {
    const uniqueOut = `${Date.now()}-${Math.random().toString(36).slice(2)}`
    const storedThumbName = `${uniqueOut}-${thumbnailName}`
    const storedThumbPath = path.join(thumbDir, storedThumbName)
    await fs.rename(thumbTmpPath, storedThumbPath)
    update.thumbnailUrl = `/uploads/academy/thumbnails/${storedThumbName}`
  }

  const updated = await Tutorial.findByIdAndUpdate(id, update, { new: true })
  if (!updated) {
    throw createError({ statusCode: 404, statusMessage: 'Tutoriel introuvable' })
  }
  return { success: true, data: updated }
})


