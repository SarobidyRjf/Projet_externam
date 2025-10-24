import { connectToDB } from '~/server/utils/mongoose'
import { LEAD_STATUS_VALUES, type LeadStatusValue } from '~/constants/lead-statuses'
import { AttributionLead } from '~/server/models/leadMeta/attributionLead.schema'
import { defineAbilitiesForUser } from '~/server/utils/caslAbility/defineAbilities'
import { getUserFromSession } from '~/server/utils/getUserFromSessions'

type IncomingStatus = {
  name?: string
  date?: string | Date | null
}

type StatusPayload = {
  id_lead?: string
  statuses?: IncomingStatus[]
}

const STATUS_SET = new Set<LeadStatusValue>(LEAD_STATUS_VALUES)

const isLeadStatusValue = (value: unknown): value is LeadStatusValue =>
  typeof value === 'string' && STATUS_SET.has(value as LeadStatusValue)

const normalizeStatusName = (name: LeadStatusValue): LeadStatusValue =>
  name === 'RDV strategique' ? 'RDV stratégique' : name

export default defineEventHandler(async (event) => {
  await connectToDB()

  const user = await getUserFromSession(event)
  const ability = await defineAbilitiesForUser(user)

  // const hasPermission = [
  //   ability.can('update', 'AttributionLead'),
  //   ability.can('create', 'AttributionLead')
  // ].some(Boolean)

  // if (!hasPermission) {
  //   throw createError({ statusCode: 403, statusMessage: "Vous n'avez pas la permission de faire cette action" })
  // }

  const body = await readBody<StatusPayload>(event)

  if (!body.id_lead) {
    throw createError({ statusCode: 400, statusMessage: 'ID du lead manquant' })
  }

  const parsedStatuses = Array.isArray(body.statuses) ? body.statuses : []
  const sanitizedStatuses = parsedStatuses
    .map((status) => {
      if (!isLeadStatusValue(status?.name)) {
        return null
      }

      if (!status.date) {
        return null
      }

      const parsedDate = new Date(status.date)
      if (Number.isNaN(parsedDate.getTime())) {
        return null
      }

      return {
        name: normalizeStatusName(status.name),
        date: parsedDate
      }
    })
    .filter((status): status is { name: LeadStatusValue; date: Date } => Boolean(status))

  if (!sanitizedStatuses.length) {
    sanitizedStatuses.push({
      name: 'Nouveau lead',
      date: new Date()
    })
  }

  const orderedStatuses = sanitizedStatuses
    .slice()
    .sort((a, b) => a.date.getTime() - b.date.getTime())

  const latestStatus = orderedStatuses[orderedStatuses.length - 1]

  const updatedLead = await AttributionLead.findByIdAndUpdate(
    body.id_lead,
    {
      $set: {
        statuses: orderedStatuses,
        status: latestStatus?.name ?? 'Nouveau lead'
      }
    },
    { new: true }
  )

  if (!updatedLead) {
    throw createError({ statusCode: 404, statusMessage: 'Lead non trouvé' })
  }

  return {
    message: 'Statuts mis à jour avec succès',
    lead: updatedLead
  }
})
