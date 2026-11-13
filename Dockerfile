# ---------- Étape 1 : l'atelier (compilation) ----------
FROM node:20-alpine AS build
WORKDIR /app
# Empêche mongodb-memory-server (outil de test) de télécharger MongoDB pendant l'installation
ENV MONGOMS_DISABLE_POSTINSTALL=1
COPY package*.json ./
RUN npm ci
COPY tsconfig*.json ./
COPY src ./src
RUN npm run build

# ---------- Étape 2 : la vitrine (image de production) ----------
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /app/dist ./dist
USER node
EXPOSE 3000
CMD ["npm", "start"]