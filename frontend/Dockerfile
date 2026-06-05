# --- Etapa de build ---
FROM node:20-slim AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# La URL de la API se "hornea" en tiempo de build (app estática).
# Apuntar a la URL pública del backend en producción.
ARG VITE_API_URL=http://localhost:8011/api
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# --- Etapa de servido (nginx) ---
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
