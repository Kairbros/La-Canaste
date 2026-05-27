import { Router } from 'express'
import { getProducts, getProductsByCategory, createProduct, updateProduct, deleteProduct } from '../controllers/product.controller'

const router = Router()

router.get('/', getProducts)
router.get('/category/:categoryId', getProductsByCategory)
router.post('/', createProduct)
router.put('/:id', updateProduct)
router.delete('/:id', deleteProduct)

export default router
