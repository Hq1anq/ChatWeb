# ===== FRONTEND BUILD =====
FROM node:25-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend .
RUN npm run build

# ===== BACKEND =====
FROM node:25-alpine
WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm install --production

COPY backend .
COPY --from=frontend-builder /app/frontend/dist ../frontend/dist

EXPOSE 5000
CMD ["node", "src/server.js"]
