import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

interface JwtPayload { id: number; role: string }

declare global {
  namespace Express {
    interface Request { user?: JwtPayload }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers['authorization']
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ error: 'No autorizado' })
  try {
    const payload = jwt.verify(header.slice(7), process.env['JWT_SECRET'] as string) as JwtPayload
    req.user = payload
    next()
  } catch {
    res.status(401).json({ error: 'Token inválido o expirado' })
  }
}

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'ADMIN') return res.status(403).json({ error: 'Acceso denegado' })
  next()
}
