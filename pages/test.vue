<template>
  <div>
    <h1>Test Socket.io</h1>
    <button @click="sendPing">Envoyer ping</button>
  </div>
</template>

<script setup>
const { $socket } = useNuxtApp();

function sendPing() {
  $socket?.emit("ping");
}
</script>
