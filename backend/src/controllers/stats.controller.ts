import { Request, Response } from 'express'
import prisma from '../lib/prisma'

export const getStats = async (_req: Request, res: Response) => {
  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfWeek = new Date(startOfDay)
  startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay())
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const [day, week, month, totalOrders, topProducts, recentOrders] = await Promise.all([
    prisma.order.aggregate({ where: { createdAt: { gte: startOfDay } }, _sum: { total: true }, _count: true }),
    prisma.order.aggregate({ where: { createdAt: { gte: startOfWeek } }, _sum: { total: true }, _count: true }),
    prisma.order.aggregate({ where: { createdAt: { gte: startOfMonth } }, _sum: { total: true }, _count: true }),
    prisma.order.count(),
    prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    }),
    prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { items: { include: { product: true } } },
    }),
  ])

  const productIds = topProducts.map(p => p.productId)
  const products = await prisma.product.findMany({ where: { id: { in: productIds } } })

  const topProductsWithName = topProducts.map(p => ({
    ...p,
    product: products.find(prod => prod.id === p.productId),
  }))

  res.json({
    day: { total: day._sum.total ?? 0, count: day._count },
    week: { total: week._sum.total ?? 0, count: week._count },
    month: { total: month._sum.total ?? 0, count: month._count },
    totalOrders,
    topProducts: topProductsWithName,
    recentOrders,
  })
}
