import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '../lib/prisma'

export const register = async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body as {
    name: string; email: string; password: string; role?: string
  }
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return res.status(400).json({ error: 'El correo ya está registrado' })

  const hashed = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({
    data: { name, email, password: hashed, role: (role as any) ?? 'CLIENTE' },
    select: { id: true, name: true, email: true, role: true },
  })
  res.status(201).json(user)
}

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body as { email: string; password: string }
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return res.status(401).json({ error: 'Credenciales incorrectas' })

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) return res.status(401).json({ error: 'Credenciales incorrectas' })

  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env['JWT_SECRET'] as string,
    { expiresIn: '8h' }
  )
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } })
}
