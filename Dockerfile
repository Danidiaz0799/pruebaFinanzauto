# Multi-stage Dockerfile para Full-Stack Tic-Tac-Toe
# Este Dockerfile construye tanto frontend como backend

# ==============================================================================
# ETAPA 1: Build del Frontend (React + Vite)
# ==============================================================================
FROM node:18-alpine as frontend-build

WORKDIR /app/frontend

# Copiar package files del frontend
COPY frontend/package*.json ./

# Instalar dependencias del frontend
RUN npm ci

# Copiar código fuente del frontend
COPY frontend/ ./

# Construir la aplicación para producción
RUN npm run build

# ==============================================================================
# ETAPA 2: Backend (Node.js + Express + Socket.IO)
# ==============================================================================
FROM node:18-alpine as backend

WORKDIR /app

# Copiar package files del backend
COPY backend/package*.json ./

# Instalar dependencias del backend
RUN npm ci --only=production

# Copiar código fuente del backend
COPY backend/ ./

# Crear usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs

# Cambiar propietario de los archivos
RUN chown -R nodejs:nodejs /app

# ==============================================================================
# ETAPA 3: Nginx + Aplicación Final
# ==============================================================================
FROM nginx:alpine as production

# Instalar Node.js en el contenedor nginx para ejecutar el backend
RUN apk add --no-cache nodejs npm

# Copiar configuración de nginx
COPY frontend/nginx.conf /etc/nginx/nginx.conf

# Copiar archivos construidos del frontend
COPY --from=frontend-build /app/frontend/dist /usr/share/nginx/html

# Copiar backend
COPY --from=backend /app /app

# Crear directorio para logs
RUN mkdir -p /var/log/app

# Crear script de inicio que ejecute tanto nginx como el backend
RUN echo '#!/bin/sh' > /start.sh && \
    echo 'cd /app && npm start &' >> /start.sh && \
    echo 'nginx -g "daemon off;"' >> /start.sh && \
    chmod +x /start.sh

# Exponer puertos
EXPOSE 80 3000

# Ejecutar script de inicio
CMD ["/start.sh"]