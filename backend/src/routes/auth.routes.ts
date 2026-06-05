import { Router } from 'express'
import { login, register } from '../controllers/auth.controller'
import { authenticate, requireAdmin } from '../middlewares/auth.middleware'

const router = Router()

// Login: público
router.post('/login', login)

// Registro: solo un ADMIN autenticado puede crear usuarios.
// (Para el primer admin se usa el panel/seed o el comando de Node.)
router.post('/register', authenticate, requireAdmin, register)

export default router
