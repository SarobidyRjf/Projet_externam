import type { NitroApp } from "nitropack";
import { Server as Engine } from "engine.io";
import { Server } from "socket.io";
import { defineNitroPlugin } from "nitropack/runtime";
import { defineEventHandler } from "h3";
import { verifyToken } from "~/server/utils/verifyToken";

export default defineNitroPlugin((nitroApp: NitroApp) => {
  const engine = new Engine();
  const io = new Server();

  // expose io globally so it can be used in API routes
  nitroApp.hooks.hook("request", (event) => {
    event.context.io = io; // dispo dans tous tes handlers
  });

  // On connecte Socket.io à Engine
  io.bind(engine);

  io.on("connection", (socket) => {
    const token = socket.handshake.auth?.token as string | undefined;
    const payload = token ? (verifyToken(token) as any) : null;

    if (!payload) {
      console.log("❌ Connexion refusée : token invalide");
      socket.disconnect();
      return;
    }

    socket.join(payload.id);
    console.log("✅ Client connecté :", socket.id, "user:", payload.id);

    // Message de bienvenue
    socket.emit("notification", { message: "Bienvenue via Engine.IO 🚀" });

    // Test ping/pong
    socket.on("ping", () => {
      console.log("📩 Reçu : ping");
      socket.emit("pong");
    });
  });

  // On déclare la route /socket.io/
  nitroApp.router.use(
    "/socket.io/",
    defineEventHandler({
      handler(event) {
        engine.handleRequest(event.node.req, event.node.res);
        // Empêche H3 de gérer la requête
        // @ts-ignore
        event._handled = true;
      },
      websocket: {
        open(peer) {
          // @ts-expect-error propriété privée
          engine.prepare(peer._internal.nodeReq);
          // @ts-expect-error propriété privée
          engine.onWebSocket(
            peer._internal.nodeReq,
            peer._internal.nodeReq.socket,
            peer.websocket
          );
        },
      },
    })
  );
});
