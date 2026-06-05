FROM node:20-slim

# OpenSSL es requerido por Prisma
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Instalar dependencias (incluye devDeps: prisma CLI, tsc, dotenv)
COPY package*.json ./
RUN npm install

# Copiar el resto del código
COPY . .

# Generar cliente Prisma y compilar TypeScript
RUN npx prisma generate
RUN npm run build

ENV NODE_ENV=production
ENV PORT=8011
EXPOSE 8011

# Aplicar migraciones y arrancar el servidor
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
