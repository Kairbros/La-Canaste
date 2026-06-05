import { Router } from 'express'
import { getProducts, getProductsByCategory, createProduct, updateProduct, deleteProduct } from '../controllers/product.controller'
import { authenticate, requireAdmin } from '../middlewares/auth.middleware'

const router = Router()

router.get('/', getProducts)
router.get('/category/:categoryId', getProductsByCategory)
router.post('/', authenticate, requireAdmin, createProduct)
router.put('/:id', authenticate, requireAdmin, updateProduct)
router.delete('/:id', authenticate, requireAdmin, deleteProduct)

export default router
