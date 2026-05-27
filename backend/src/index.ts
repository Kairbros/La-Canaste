import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth.routes'
import categoryRoutes from './routes/category.routes'
import productRoutes from './routes/product.routes'
import orderRoutes from './routes/order.routes'
import statsRoutes from './routes/stats.routes'

const app = express()
const PORT = process.env['PORT'] ?? 4000

app.use(cors())
app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Servidor Minimercado corriendo' })
})

app.use('/api/auth', authRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/products', productRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/stats', statsRoutes)

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
})
