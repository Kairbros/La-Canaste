import { Request, Response } from 'express'
import prisma from '../lib/prisma'
import { distanceKm } from '../lib/geo'

const deliverySelect = { select: { id: true, name: true } }

export const getOrders = async (_req: Request, res: Response) => {
  const orders = await prisma.order.findMany({
    include: { items: { include: { product: true } }, delivery: deliverySelect },
    orderBy: { createdAt: 'desc' },
  })
  res.json(orders)
}

export const getOrderById = async (req: Request, res: Response) => {
  const order = await prisma.order.findUnique({
    where: { id: Number(req.params['id']) },
    include: { items: { include: { product: true } }, delivery: deliverySelect },
  })
  if (!order) return res.status(404).json({ error: 'Pedido no encontrado' })
  res.json(order)
}

// Pedidos asignados al domiciliario autenticado.
export const getMyDeliveries = async (req: Request, res: Response) => {
  const orders = await prisma.order.findMany({
    where: { deliveryId: req.user!.id },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: 'desc' },
  })
  res.json(orders)
}

// Asignar un domiciliario a un pedido (admin).
export const assignOrder = async (req: Request, res: Response) => {
  const { deliveryId } = req.body as { deliveryId: number | null }
  const order = await prisma.order.update({
    where: { id: Number(req.params['id']) },
    data: { deliveryId },
    include: { delivery: deliverySelect },
  })
  res.json(order)
}

export const createOrder = async (req: Request, res: Response) => {
  const { clientName, address, phone, latitude, longitude, items } = req.body as {
    clientName: string
    address: string
    phone: string
    latitude?: number
    longitude?: number
    items: { productId: number; quantity: number; unitPrice: number }[]
  }

  if (!clientName || !address || !phone || !items?.length) {
    return res.status(400).json({ error: 'Faltan datos del pedido' })
  }

  // Validar cobertura si se enviaron coordenadas
  if (latitude !== undefined && longitude !== undefined) {
    const config = await prisma.config.upsert({ where: { id: 1 }, update: {}, create: { id: 1 } })
    const distance = distanceKm(config.storeLat, config.storeLng, latitude, longitude)
    if (distance > config.coverageRadius) {
      return res.status(400).json({
        error: `La dirección está fuera del radio de cobertura (${distance.toFixed(2)} km de ${config.coverageRadius} km)`,
      })
    }
  }

  const total = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)

  const order = await prisma.order.create({
    data: {
      clientName,
      address,
      phone,
      total,
      latitude,
      longitude,
      items: { create: items },
    },
    include: { items: { include: { product: true } } },
  })

  res.status(201).json(order)
}

export const updateOrderStatus = async (req: Request, res: Response) => {
  const { status } = req.body as { status: string }
  const id = Number(req.params['id'])

  // Un domiciliario solo puede actualizar pedidos asignados a él.
  if (req.user!.role === 'DOMICILIARIO') {
    const order = await prisma.order.findUnique({ where: { id }, select: { deliveryId: true } })
    if (!order) return res.status(404).json({ error: 'Pedido no encontrado' })
    if (order.deliveryId !== req.user!.id) {
      return res.status(403).json({ error: 'Este pedido no está asignado a ti' })
    }
  }

  const order = await prisma.order.update({
    where: { id },
    data: { status: status as any },
  })
  res.json(order)
}
