import { Router } from 'express'
import { getUsers, createUser, deleteUser } from '../controllers/user.controller'
import { authenticate, requireAdmin } from '../middlewares/auth.middleware'

const router = Router()

// Gestión de usuarios: solo ADMIN
router.get('/', authenticate, requireAdmin, getUsers)
router.post('/', authenticate, requireAdmin, createUser)
router.delete('/:id', authenticate, requireAdmin, deleteUser)

export default router
