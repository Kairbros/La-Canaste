import { Request, Response } from 'express'
import prisma from '../lib/prisma'

export const getCategories = async (_req: Request, res: Response) => {
  const categories = await prisma.category.findMany({ include: { products: true } })
  res.json(categories)
}

export const createCategory = async (req: Request, res: Response) => {
  const { name } = req.body as { name: string }
  const category = await prisma.category.create({ data: { name } })
  res.status(201).json(category)
}

export const updateCategory = async (req: Request, res: Response) => {
  const { id } = req.params
  const { name } = req.body as { name: string }
  const category = await prisma.category.update({ where: { id: Number(id) }, data: { name } })
  res.json(category)
}

export const deleteCategory = async (req: Request, res: Response) => {
  const id = Number(req.params['id'])
  const count = await prisma.product.count({ where: { categoryId: id } })
  if (count > 0) {
    return res.status(409).json({
      error: `No se puede eliminar: la categoría tiene ${count} producto(s). Elimina o reasigna esos productos primero.`,
    })
  }
  await prisma.category.delete({ where: { id } })
  res.status(204).send()
}
