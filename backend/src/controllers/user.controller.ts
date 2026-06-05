import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import prisma from '../lib/prisma'

// Lista usuarios; admite filtrar por rol con ?role=DOMICILIARIO
export const getUsers = async (req: Request, res: Response) => {
  const role = req.query['role'] as string | undefined
  const users = await prisma.user.findMany({
    where: role ? { role: role as any } : undefined,
    select: { id: true, name: true, email: true, role: true, phone: true, createdAt: true },
    orderBy: { name: 'asc' },
  })
  res.json(users)
}

export const createUser = async (req: Request, res: Response) => {
  const { name, email, password, role, phone } = req.body as {
    name: string; email: string; password: string; role?: string; phone?: string
  }
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return res.status(400).json({ error: 'El correo ya está registrado' })

  const hashed = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({
    data: { name, email, password: hashed, role: (role as any) ?? 'CLIENTE', phone },
    select: { id: true, name: true, email: true, role: true, phone: true },
  })
  res.status(201).json(user)
}

export const deleteUser = async (req: Request, res: Response) => {
  await prisma.user.delete({ where: { id: Number(req.params['id']) } })
  res.status(204).send()
}
