import { io } from "socket.io-client";
import { watch } from "vue";
import { useNotificationStore } from "~/stores/notification";

export default defineNuxtPlugin((nuxtApp) => {
  const token = useCookie<string | null>("token");
  const notificationStore = useNotificationStore();
  let socket: ReturnType<typeof io> | null = null;

  const connectSocket = () => {
    if (!token.value) return;

    // Déconnecter l'ancienne connexion si elle existe
    socket?.disconnect();

    socket = io("http://localhost:3000", {
      transports: ["websocket"],
      auth: { token: token.value },
    });

    // Écouter la notification
    socket.on("notification", (data) => {
      console.log("🔔 Notification reçue :", data.payload?.message || data.message);
      notificationStore.addNotification({
        ...data,
        read: false, // forcer "non lu"
        createdAt: data.createdAt ?? new Date().toISOString(), // fallback si absent
      });
    });

    // Tester ping/pong
    socket.emit("ping");
    socket.on("pong", () => {
      console.log("✅ Pong reçu !");
    });

    nuxtApp.provide("socket", socket);
  };

  const disconnectSocket = () => {
    socket?.disconnect();
    socket = null;
    nuxtApp.provide("socket", null);
  };

  watch(
    token,
    (newToken) => {
      if (newToken) connectSocket();
      else disconnectSocket();
    },
    { immediate: true }
  );
});
