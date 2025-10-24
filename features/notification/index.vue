<script setup lang="ts">
import { Bell } from 'lucide-vue-next'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { useNotificationStore } from '~/stores/notification'
import type { Notification } from '~/stores/notification'
import { useFormatDateTime } from '@/composables/formatData'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const notificationStore = useNotificationStore()
const { formatDateTime } = useFormatDateTime()
const router = useRouter()
const showBadge = ref(true)

onMounted(() => {
  notificationStore.fetchNotifications()
})

const handleNotificationSelect = async (notif: Notification) => {
  await notificationStore.markAsRead(notif._id)
  router.push('/manage-leads')
}

const unreadCount = computed(() => notificationStore.unreadCount)

watch(
  () => notificationStore.unreadCount,
  (count) => {
    if (count > 0) {
      showBadge.value = true
    }
  }
)

function handleOpenDropdown() {
  showBadge.value = false; // masque le badge après clic
  notificationStore.markAllAsRead()
}
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child @click="handleOpenDropdown">
      <Button variant="ghost" class="relative h-8 w-8 rounded-full">
        <Bell class="h-4 w-4" />
        <span
          v-show="showBadge && unreadCount > 0"
          class="absolute top-0 right-0 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-xs text-white"
        >
          {{ unreadCount }}
        </span>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent side="bottom" class="w-56">
      <DropdownMenuLabel class="font-normal">Notifications</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <template v-if="notificationStore.notifications.length">
        <DropdownMenuItem
          v-for="(notif, index) in notificationStore.notifications"
          :key="index"
          :class="notif.read ? 'bg-gray-50' : 'bg-blue-50'"
          @click="handleNotificationSelect(notif)"
        >
          <span class="flex flex-col space-y-1">
            <span class="text-sm font-medium leading-none">{{ notif.payload?.message }}</span>
            <span>
              {{
                notif.createdAt
                  ? formatDateTime(new Date(notif.createdAt).toLocaleString())
                  : ''
              }}
            </span>
          </span>
        </DropdownMenuItem>
      </template>
      <p v-else class="p-2 text-sm text-muted-foreground">Aucune notification</p>
    </DropdownMenuContent>
  </DropdownMenu>
</template>