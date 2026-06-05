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

  // Serie de ventas por día (últimos 14 días) para la gráfica de tendencia
  const DAYS = 14
  const since = new Date(startOfDay)
  since.setDate(since.getDate() - (DAYS - 1))
  const seriesOrders = await prisma.order.findMany({
    where: { createdAt: { gte: since } },
    select: { createdAt: true, total: true },
  })
  const salesByDay = Array.from({ length: DAYS }, (_, i) => {
    const d = new Date(since)
    d.setDate(since.getDate() + i)
    const next = new Date(d)
    next.setDate(d.getDate() + 1)
    const dayOrders = seriesOrders.filter(o => o.createdAt >= d && o.createdAt < next)
    return {
      date: d.toISOString().slice(0, 10),
      total: dayOrders.reduce((s, o) => s + o.total, 0),
      count: dayOrders.length,
    }
  })

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
    salesByDay,
    topProducts: topProductsWithName,
    recentOrders,
  })
}
