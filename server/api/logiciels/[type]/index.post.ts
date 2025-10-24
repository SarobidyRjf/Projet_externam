import { defineEventHandler, readBody, createError } from 'h3'
import { connectToDB } from '~/server/utils/mongoose'
import { getUserFromSession } from '~/server/utils/getUserFromSessions'
import { defineAbilitiesForUser } from '~/server/utils/caslAbility/defineAbilities'
import { resolveSoftwareModel, type SoftwareCategory, type SoftwareField } from '~/server/models/software/software.schema'

type SoftwarePayload = {
  label?: string
  fields?: SoftwareField[] | Array<{ key?: string; value?: string }>
}

const sanitizeFields = (fields: SoftwarePayload['fields']): SoftwareField[] => {
  if (!Array.isArray(fields)) {
    return []
  }

  return fields
    .map((field) => ({
      key: (field?.key ?? '').toString().trim(),
      value: (field?.value ?? '').toString().trim()
    }))
    .filter((field) => field.key && field.value)
}

export default defineEventHandler(async (event) => {
  await connectToDB()

  const user = await getUserFromSession(event)
  const ability = await defineAbilitiesForUser(user)
  const canCreate =
    ability?.can('manage', 'LeadMeta') ||
    ability?.can('create', 'LeadMeta') ||
    ability?.can('update', 'LeadMeta')

  if (!canCreate) {
    throw createError({ statusCode: 403, statusMessage: "Vous n'avez pas la permission de faire cette action" })
  }

  const params = event.context.params || {}
  const typeParam = params.type as SoftwareCategory | undefined
  const Model = resolveSoftwareModel(typeParam)

  if (!Model || !typeParam) {
    throw createError({ statusCode: 400, statusMessage: 'Type de logiciel inconnu' })
  }

  const body = await readBody<SoftwarePayload>(event)
  const label = body.label?.toString().trim()

  if (!label) {
    throw createError({ statusCode: 400, statusMessage: 'Le libellé est requis' })
  }

  const fields = sanitizeFields(body.fields)

  const created = await Model.create({
    label,
    fields
  })

  return {
    message: 'Logiciel créé avec succès',
    data: created.toObject()
  }
})
