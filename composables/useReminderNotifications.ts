import { ref } from 'vue'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'

import { buildReminderToastMessage } from '@/lib/reminders'

const REMINDER_GRACE_PERIOD_MS = 60 * 1000

type ReminderTimeout = ReturnType<typeof setTimeout>

const scheduledTimeouts = ref<ReminderTimeout[]>([])
const triggeredReminderKeys = new Set<string>()

export interface ReminderNotification {
  date: Date
  minutes: number
  leadName?: string
}

export const useReminderNotifications = () => {
  const clearTimers = () => {
    if (!scheduledTimeouts.value.length) {
      return
    }

    scheduledTimeouts.value.forEach((timeoutId) => clearTimeout(timeoutId))
    scheduledTimeouts.value = []
  }

  const reset = () => {
    clearTimers()
    triggeredReminderKeys.clear()
  }

  const showReminderToast = (reminder: ReminderNotification) => {
    const message = buildReminderToastMessage(reminder.minutes, reminder.leadName)

    toast.warning(message, {
      position: toast.POSITION.TOP_CENTER,
      autoClose: false,
      closeOnClick: true,
      pauseOnHover: true,
      hideProgressBar: true
    })
  }

  const scheduleReminders = (reminders: ReminderNotification[]) => {
    if (typeof window === 'undefined') {
      return
    }

    clearTimers()

    reminders.forEach((reminder) => {
      const reminderKey = `${reminder.date.getTime()}-${reminder.minutes}`
      if (triggeredReminderKeys.has(reminderKey)) {
        return
      }

      const delay = reminder.date.getTime() - Date.now()

      if (delay <= 0) {
        if (delay >= -REMINDER_GRACE_PERIOD_MS) {
          showReminderToast(reminder)
          triggeredReminderKeys.add(reminderKey)
        }
        return
      }

      const timeoutId = window.setTimeout(() => {
        showReminderToast(reminder)
        triggeredReminderKeys.add(reminderKey)
      }, delay)

      scheduledTimeouts.value.push(timeoutId)
    })
  }

  return {
    scheduleReminders,
    reset
  }
}
