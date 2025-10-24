const MINUTES_IN_DAY = 1440
const MINUTES_IN_HOUR = 60

interface DurationParts {
  days: number
  hours: number
  minutes: number
}

const getDurationParts = (totalMinutes: number): DurationParts => {
  const days = Math.floor(totalMinutes / MINUTES_IN_DAY)
  const hours = Math.floor((totalMinutes % MINUTES_IN_DAY) / MINUTES_IN_HOUR)
  const minutes = totalMinutes % MINUTES_IN_HOUR

  return { days, hours, minutes }
}

const formatDurationParts = ({ days, hours, minutes }: DurationParts): string => {
  const parts: string[] = []

  if (days) {
    parts.push(`${days} jour${days > 1 ? 's' : ''}`)
  }

  if (hours) {
    parts.push(`${hours} h`)
  }

  if (minutes) {
    parts.push(`${minutes} min`)
  }

  return parts.join(' ')
}

export const formatReminderDuration = (minutes: number): string => {
  if (minutes === 0) {
    return "À l'heure du rendez-vous"
  }

  const formattedDuration = formatDurationParts(getDurationParts(minutes))
  return formattedDuration ? `${formattedDuration} avant` : "À l'avance"
}

export const buildReminderToastMessage = (minutes: number, leadName?: string): string => {
  if (minutes === 0) {
    return leadName
      ? `Le rendez-vous avec ${leadName} commence maintenant.`
      : 'Votre rendez-vous commence maintenant.'
  }

  const formattedDuration = formatDurationParts(getDurationParts(minutes)) || 'quelques instants'
  const prefix = leadName ? `Vous avez un rendez-vous avec ${leadName}` : 'Vous avez un rendez-vous'

  return `${prefix} dans ${formattedDuration}.`
}
