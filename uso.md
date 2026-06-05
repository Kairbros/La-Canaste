# Guía de uso — La Canasta (Minimercado)

Plataforma web de pedidos a domicilio para minimercado de barrio.
Tres partes: **tienda del cliente**, **panel de administración** y **vista del domiciliario**.

---

## 1. Accesos (usuarios)

| Rol | Correo | Contraseña | Entra en |
|-----|--------|-----------|----------|
| Administrador | `admin@test.com` | `admin123` | `/admin/login` → `/admin` |
| Domiciliario (ejemplo) | `carlos@test.com` | `carlos123` | `/admin/login` → `/repartidor` |

> Estos son los usuarios de prueba. Puedes crear más desde el panel admin (menú **Usuarios**).
> El login es el mismo para admin y domiciliario: según el rol, el sistema te lleva al panel correcto.

### Crear un administrador nuevo (si hiciera falta)
Desde Swagger (`http://localhost:4000/api-docs` → `POST /api/auth/register`) o por terminal:

```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin","email":"admin@test.com","password":"admin123","role":"ADMIN"}'
```

---

## 2. Direcciones (URLs)

| Qué | URL |
|-----|-----|
| Tienda del cliente (catálogo) | http://localhost:5173/ |
| Login panel (admin y domiciliario) | http://localhost:5173/admin/login |
| Panel admin | http://localhost:5173/admin |
| Vista del domiciliario | http://localhost:5173/repartidor |
| API backend | http://localhost:4000 |
| Documentación de la API (Swagger) | http://localhost:4000/api-docs |

---

## 3. Cargar productos (admin)

1. Entra en **/admin/login** con el usuario administrador.
2. **Categorías** (🗂): crea primero las categorías (ej: Lácteos, Bebidas, Aseo, Granos).
3. **Inventario / Productos** (📦): crea cada producto con:
   - Nombre
   - Precio
   - Categoría
   - Imagen (URL; si la dejas vacía se muestra un icono)
   - Disponible (sí/no)
4. Los productos aparecen automáticamente en la tienda del cliente (`/`).

---

## 4. Flujo del domiciliario

1. **Crear el domiciliario**: admin → **Usuarios** (👥) → "Nuevo usuario" con rol **Domiciliario** (correo + contraseña).
2. **Asignar pedidos**: admin → **Pedidos** (📋) → en cada pedido, usar el selector "🚴 Sin asignar" para elegir al domiciliario.
3. **El domiciliario trabaja**: inicia sesión en **/admin/login** con sus credenciales → cae en **/repartidor**, donde ve:
   - Solo los pedidos asignados a él.
   - El **mapa** con la ubicación de entrega y el círculo de cobertura.
   - Botón **Navegar** (abre Google Maps con la ruta).
   - Botones para marcar **En camino** y **Entregado**.

---

## 5. Cobertura de domicilios

- En admin → **Cobertura** (📍) se define:
  - Ubicación de la tienda (latitud/longitud).
  - Radio de cobertura en kilómetros.
- En el **checkout**, el cliente marca su ubicación en el mapa (o usa "Usar mi ubicación").
  Si está **fuera del radio**, no puede enviar el pedido.
- Nota: la geolocalización del navegador en **computadores es imprecisa** (usa IP/WiFi).
  En el celular es mucho más exacta. Siempre se puede ajustar tocando el mapa.

---

## 6. Pedidos por WhatsApp

- Número del negocio configurado: **+57 314 406 3533**
  (se cambia en `frontend/src/pages/CheckoutPage.tsx`, constante `WHATSAPP_NUMBER`).
- Al confirmar, se registra el pedido en el sistema **y** se abre WhatsApp con un mensaje
  en texto limpio que incluye cliente, dirección, teléfono, productos, total y un enlace
  de Google Maps con la ubicación de entrega.

---

## 7. Cómo levantar el proyecto

### Opción A — Docker (todo junto)
```bash
docker compose up -d --build
```
- Tienda: http://localhost:8010
- API: http://localhost:8011 (Swagger en /api-docs)
- Base de datos PostgreSQL: puerto 8012

### Opción B — Desarrollo (con recarga)
```bash
# Base de datos (solo una vez)
docker run -d --name canasta-db -e POSTGRES_USER=canasta -e POSTGRES_PASSWORD=canasta -e POSTGRES_DB=canasta -p 8012:5432 postgres:16-alpine

# Backend
cd backend
npm install
npx prisma migrate deploy
npm run dev            # http://localhost:4000

# Frontend (otra terminal)
cd frontend
npm install
npm run dev            # http://localhost:5173
```

---

## 8. Estructura del proyecto

- `backend/` — API REST (Express + Prisma + PostgreSQL).
- `frontend/` — Tienda y panel (React + Vite + Tailwind + Leaflet).
- `docs/` — Prototipos de diseño (HTML/CSS) usados como referencia visual.
