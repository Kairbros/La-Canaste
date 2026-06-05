import { Router } from 'express'
import { getOrders, getOrderById, createOrder, updateOrderStatus, getMyDeliveries, assignOrder } from '../controllers/order.controller'
import { authenticate, requireAdmin, requireRole } from '../middlewares/auth.middleware'

const router = Router()

// Crear pedido es público (clientes desde el checkout)
router.post('/', createOrder)

// Pedidos asignados al domiciliario autenticado
router.get('/mine', authenticate, requireRole('DOMICILIARIO', 'ADMIN'), getMyDeliveries)

// Gestión de pedidos: solo ADMIN
router.get('/', authenticate, requireAdmin, getOrders)
router.get('/:id', authenticate, requireAdmin, getOrderById)
router.patch('/:id/assign', authenticate, requireAdmin, assignOrder)

// Cambiar estado: ADMIN cualquiera, DOMICILIARIO solo los suyos (validado en el controlador)
router.patch('/:id/status', authenticate, requireRole('ADMIN', 'DOMICILIARIO'), updateOrderStatus)

export default router
