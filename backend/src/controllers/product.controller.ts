import { Request, Response } from 'express'
import prisma from '../lib/prisma'

export const getProducts = async (_req: Request, res: Response) => {
  const products = await prisma.product.findMany({ include: { category: true } })
  res.json(products)
}

export const getProductsByCategory = async (req: Request, res: Response) => {
  const { categoryId } = req.params
  const products = await prisma.product.findMany({
    where: { categoryId: Number(categoryId), available: true },
    include: { category: true },
  })
  res.json(products)
}

export const createProduct = async (req: Request, res: Response) => {
  const { name, price, image, available, categoryId } = req.body as {
    name: string
    price: number
    image?: string
    available?: boolean
    categoryId: number
  }
  const product = await prisma.product.create({
    data: { name, price, image, available: available ?? true, categoryId },
  })
  res.status(201).json(product)
}

export const updateProduct = async (req: Request, res: Response) => {
  const { id } = req.params
  const data = req.body as {
    name?: string
    price?: number
    image?: string
    available?: boolean
    categoryId?: number
  }
  const product = await prisma.product.update({ where: { id: Number(id) }, data })
  res.json(product)
}

export const deleteProduct = async (req: Request, res: Response) => {
  const { id } = req.params
  await prisma.product.delete({ where: { id: Number(id) } })
  res.status(204).send()
}
