# Imagen de la API: Node.js + Express

# Imagen base oficial: Node 22 sobre Alpine Linux 
FROM node:22-alpine

# Modo producción
ENV NODE_ENV=production

# Carpeta de trabajo dentro del contenedor
WORKDIR /app

# Primero solo las dependencias. Si el código cambia pero estas no,
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Después el código de la API
COPY src ./src

# Se ejecuta con el usuario "node"
USER node

# Puerto en que escucha la API
EXPOSE 3000

# Cada 10 segundos revisa que la API y la base de datos respondan
HEALTHCHECK --interval=10s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/api/health > /dev/null || exit 1

# Comando que inicia la API
CMD ["node", "src/server.js"]