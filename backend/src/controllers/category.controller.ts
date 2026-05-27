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
  const { id } = req.params
  await prisma.category.delete({ where: { id: Number(id) } })
  res.status(204).send()
}
