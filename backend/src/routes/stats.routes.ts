import { Router } from 'express'
import { getStats } from '../controllers/stats.controller'
import { authenticate, requireAdmin } from '../middlewares/auth.middleware'

const router = Router()

router.get('/', authenticate, requireAdmin, getStats)

export default router
