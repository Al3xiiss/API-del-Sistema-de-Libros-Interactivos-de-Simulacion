# Imagen del frontend: se compila con Node y se sirve con nginx

# Etapa 1: compilar la aplicación 
FROM node:22-alpine AS build
WORKDIR /app

# Cypress solo se usa para pruebas no se descarga el programa entero
ENV CYPRESS_INSTALL_BINARY=0

# Dependencias primero, para aprovechar la caché de Docker
COPY package.json package-lock.json ./
RUN npm ci

# Código del frontend
COPY . .

# La API se llama en la misma dirección del frontend (/api) y nginx la reenvía
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

#  Etapa 2: servir los archivos con nginx 
FROM nginx:stable-alpine

# Configuración de nginx y archivos compilados de la etapa 1
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80