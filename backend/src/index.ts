import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import swaggerUi from 'swagger-ui-express'
import { swaggerSpec } from './swagger'
import authRoutes from './routes/auth.routes'
import categoryRoutes from './routes/category.routes'
import productRoutes from './routes/product.routes'
import orderRoutes from './routes/order.routes'
import statsRoutes from './routes/stats.routes'
import configRoutes from './routes/config.routes'
import userRoutes from './routes/user.routes'

const app = express()
const PORT = process.env['PORT'] ?? 4000

app.use(cors())
app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Servidor Minimercado corriendo' })
})

// Documentación Swagger / OpenAPI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
app.get('/api-docs.json', (_req, res) => res.json(swaggerSpec))

app.use('/api/auth', authRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/products', productRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/stats', statsRoutes)
app.use('/api/config', configRoutes)
app.use('/api/users', userRoutes)

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
  console.log(`Documentación Swagger en http://localhost:${PORT}/api-docs`)
})
