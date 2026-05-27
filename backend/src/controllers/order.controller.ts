import { Request, Response } from 'express'
import prisma from '../lib/prisma'

export const getOrders = async (_req: Request, res: Response) => {
  const orders = await prisma.order.findMany({
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: 'desc' },
  })
  res.json(orders)
}

export const getOrderById = async (req: Request, res: Response) => {
  const order = await prisma.order.findUnique({
    where: { id: Number(req.params['id']) },
    include: { items: { include: { product: true } } },
  })
  if (!order) return res.status(404).json({ error: 'Pedido no encontrado' })
  res.json(order)
}

export const createOrder = async (req: Request, res: Response) => {
  const { clientName, address, phone, items } = req.body as {
    clientName: string
    address: string
    phone: string
    items: { productId: number; quantity: number; unitPrice: number }[]
  }

  if (!clientName || !address || !phone || !items?.length) {
    return res.status(400).json({ error: 'Faltan datos del pedido' })
  }

  const total = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)

  const order = await prisma.order.create({
    data: {
      clientName,
      address,
      phone,
      total,
      items: { create: items },
    },
    include: { items: { include: { product: true } } },
  })

  res.status(201).json(order)
}

export const updateOrderStatus = async (req: Request, res: Response) => {
  const { status } = req.body as { status: string }
  const order = await prisma.order.update({
    where: { id: Number(req.params['id']) },
    data: { status: status as any },
  })
  res.json(order)
}
