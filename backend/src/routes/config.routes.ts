import { Router } from 'express'
import { getConfig, updateConfig, checkCoverage } from '../controllers/config.controller'
import { authenticate, requireAdmin } from '../middlewares/auth.middleware'

const router = Router()

// Públicas: leer config y verificar cobertura (usadas por el checkout)
router.get('/', getConfig)
router.get('/coverage', checkCoverage)

// Solo ADMIN: actualizar la configuración de la tienda
router.put('/', authenticate, requireAdmin, updateConfig)

export default router
