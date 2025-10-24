import { defineEventHandler, createError, getHeader } from 'h3'
import path from 'path'
import { promises as fs } from 'fs'
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

  const user = await getUserFromSession(event)
  const ability = await defineAbilitiesForUser(user as any)
  if (!ability.can('create', 'Tutorial') && !ability.can('manage', 'all')) {
    throw createError({ statusCode: 403, statusMessage: 'Accès refusé' })
  }

  // Lecture STREAMING via Busboy pour supporter les très gros fichiers
  const contentType = getHeader(event, 'content-type') || ''
  if (!contentType.includes('multipart/form-data')) {
    throw createError({ statusCode: 400, statusMessage: 'Type de contenu invalide' })
  }

  let title = ''
  let description = ''
  let type: 'video' | 'pdf' | '' = ''
  let tags: string[] = []
  let published = true
  let durationMinutes = 0
  let fileTmpPath: string | undefined
  let fileName: string | undefined
  let fileMime: string | undefined
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
    busboy.on('file', async (fieldname, file, info) => {
      const { filename, mimeType } = info as any
      const unique = `${Date.now()}-${Math.random().toString(36).slice(2)}`
      if (fieldname === 'file') {
        fileName = filename as string
        fileMime = (mimeType as string) || ''
        const tmp = path.join(baseDir, `${unique}-${filename}.uploading`)
        fileTmpPath = tmp
        const write = (await import('node:fs')).createWriteStream(tmp)
        file.pipe(write)
        write.on('error', reject)
      } else if (fieldname === 'thumbnail') {
        thumbnailName = filename as string
        const tmp = path.join(baseDir, `${unique}-${filename}.thumb`)
        thumbTmpPath = tmp
        const write = (await import('node:fs')).createWriteStream(tmp)
        file.pipe(write)
        write.on('error', reject)
      } else {
        file.resume()
      }
    })
    busboy.on('field', (name, val) => {
      const value = String(val ?? '')
      if (name === 'title') title = value.trim()
      else if (name === 'description') description = value
      else if (name === 'type') type = value === 'pdf' ? 'pdf' : 'video'
      else if (name === 'tags') tags = value.split(',').map(t => t.trim()).filter(Boolean)
      else if (name === 'published') published = value === 'true' || value === '1'
      else if (name === 'durationMinutes') durationMinutes = Number(value) || 0
    })
    busboy.on('error', reject)
    busboy.on('finish', () => resolve())
    ;(event.node.req as any).pipe(busboy)
  })

  await parsing

  if (!title || !type) {
    throw createError({ statusCode: 400, statusMessage: 'Titre et type requis' })
  }
  if (!fileTmpPath || !fileName) {
    throw createError({ statusCode: 400, statusMessage: 'Fichier manquant' })
  }

  // Validate size (max 4GB) and type
  const maxSize = 4 * 1024 * 1024 * 1024
  
  // Validation plus robuste: MIME et extension
  const ext = typeof fileName === 'string' ? (fileName.split('.').pop()?.toLowerCase() || '') : ''
  if (type === 'video') {
    const videoMimes = ['video/mp4','video/avi','video/mov','video/wmv','video/flv','video/webm','video/mkv','video/quicktime']
    const videoExts = ['mp4','avi','mov','wmv','flv','webm','mkv','qt']
    const mimeOk = videoMimes.includes(String(fileMime || '').toLowerCase()) || String(fileMime || '').startsWith('video/')
    const extOk = videoExts.includes(ext)
    if (!mimeOk && !extOk) {
      console.log('MIME/EXT non valide:', fileMime, ext)
      throw createError({ statusCode: 400, statusMessage: 'Type de fichier vidéo invalide. Types acceptés: MP4, AVI, MOV, WMV, FLV, WebM, MKV, QuickTime' })
    }
  } else if (type === 'pdf') {
    const mimeOk = String(fileMime || '').toLowerCase().includes('pdf') || fileMime === 'application/pdf'
    const extOk = ext === 'pdf'
    if (!mimeOk && !extOk) {
      console.log('MIME/EXT non valide:', fileMime, ext)
      throw createError({ statusCode: 400, statusMessage: 'Type de fichier PDF invalide' })
    }
  }

  const typeDir = path.join(baseDir, type === 'pdf' ? 'pdfs' : 'videos')
  const uniqueOut = `${Date.now()}-${Math.random().toString(36).slice(2)}`
  const storedFileName = `${uniqueOut}-${fileName}`
  const storedFilePath = path.join(typeDir, storedFileName)
  // Déplace le fichier temporaire vers le dossier final (rename est atomique et rapide)
  await fs.rename(fileTmpPath, storedFilePath)
  const fileUrl = `/uploads/academy/${type === 'pdf' ? 'pdfs' : 'videos'}/${storedFileName}`

  let thumbnailUrl = ''
  if (thumbTmpPath && thumbnailName) {
    const storedThumbName = `${uniqueOut}-${thumbnailName}`
    const storedThumbPath = path.join(thumbDir, storedThumbName)
    await fs.rename(thumbTmpPath, storedThumbPath)
    thumbnailUrl = `/uploads/academy/thumbnails/${storedThumbName}`
  }

  const tutorial = await Tutorial.create({
    title,
    description,
    type,
    fileUrl,
    thumbnailUrl,
    tags,
    published,
    durationMinutes,
    createdBy: (user as any)._id,
  })

  return { success: true, data: tutorial }
})


