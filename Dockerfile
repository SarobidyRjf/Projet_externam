# Step 1 — Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copie package.json séparément pour optimiser le cache Docker
COPY package*.json ./

# Install des dépendances
RUN npm install

# Copie du reste des fichiers
COPY . .

# Build Nuxt (production)
RUN npm run build

# Step 2 — Runner minimal
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copie le résultat du build
COPY --from=builder /app/.output .output
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

ENV NITRO_HOST=0.0.0.0
ENV NITRO_PORT=3000
EXPOSE 3000

# Commande de démarrage du serveur Nuxt
CMD ["node", ".output/server/index.mjs"]