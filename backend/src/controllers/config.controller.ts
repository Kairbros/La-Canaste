import { Request, Response } from 'express'
import prisma from '../lib/prisma'
import { distanceKm } from '../lib/geo'

// Hay una única fila de configuración (id = 1). La creamos si no existe.
const ensureConfig = () =>
  prisma.config.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 },
  })

export const getConfig = async (_req: Request, res: Response) => {
  const config = await ensureConfig()
  res.json(config)
}

export const updateConfig = async (req: Request, res: Response) => {
  const { coverageRadius, storeLat, storeLng } = req.body as {
    coverageRadius?: number
    storeLat?: number
    storeLng?: number
  }

  await ensureConfig()
  const config = await prisma.config.update({
    where: { id: 1 },
    data: {
      ...(coverageRadius !== undefined ? { coverageRadius } : {}),
      ...(storeLat !== undefined ? { storeLat } : {}),
      ...(storeLng !== undefined ? { storeLng } : {}),
    },
  })
  res.json(config)
}

// Comprueba si unas coordenadas están dentro del radio de cobertura.
export const checkCoverage = async (req: Request, res: Response) => {
  const lat = Number(req.query['lat'])
  const lng = Number(req.query['lng'])
  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return res.status(400).json({ error: 'Parámetros lat y lng requeridos' })
  }

  const config = await ensureConfig()
  const distance = distanceKm(config.storeLat, config.storeLng, lat, lng)
  res.json({
    covered: distance <= config.coverageRadius,
    distance: Number(distance.toFixed(2)),
    coverageRadius: config.coverageRadius,
  })
}
