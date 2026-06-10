# Build client
FROM node:20-alpine AS client-builder
WORKDIR /app
COPY package.json package-lock.json* ./
COPY client/package.json ./client/
COPY server/package.json ./server/
RUN npm ci --workspace=client --include-workspace-root
COPY client ./client
COPY server ./server
RUN npm run build -w client

# Build server
FROM node:20-alpine AS server-builder
WORKDIR /app
COPY package.json package-lock.json* ./
COPY server/package.json ./server/
RUN npm ci --workspace=server --include-workspace-root
COPY server ./server
RUN npm run build -w server

# Production
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json* ./
COPY server/package.json ./server/
RUN npm ci --workspace=server --include-workspace-root --production
COPY --from=server-builder /app/server/dist ./server/dist
COPY --from=client-builder /app/client/dist ./client/dist
COPY server/.env* ./server/
EXPOSE 3001
CMD ["node", "server/dist/index.js"]
