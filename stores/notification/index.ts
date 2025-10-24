import { defineStore } from 'pinia';

export interface Notification {
  _id?: string;
  type?: string;
  payload?: Record<string, any>;
  read?: boolean;
  createdAt?: string;
}

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    notifications: [] as Notification[],
  }),
  getters: {
    unreadCount: (state) => state.notifications.filter((n) => !n.read).length,
  },
  actions: {
    async fetchNotifications() {
      try {
        const data = await $fetch<Notification[]>("/api/notifications");
        this.notifications = data.map((n) => ({
          ...n,
          read: n.read ?? false,
        }));
      } catch (error) {
        console.error("Failed to fetch notifications", error);
      }
    },
    addNotification(notification: Notification) {
      this.notifications.unshift({ ...notification, read: notification.read ?? false });
    },
    markAllAsRead() {
      this.notifications.forEach((n) => (n.read = true));
    },
    async markAsRead(id?: string) {
      if (!id) return
      const notif = this.notifications.find((n) => n._id === id)
      if (notif?.read) return
      try {
        await $fetch(`/api/notifications/${id}/read`, { method: 'PATCH' })
        if (notif) notif.read = true
      } catch (error) {
        console.error('Failed to mark notification as read', error)
      }
    },
  },
});

