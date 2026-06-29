import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()
export const bookingsRouter = Router()

bookingsRouter.get('/all', async (_req, res) => {
  const bookings = await prisma.booking.findMany({
    include: {
      user: { select: { name: true } },
      desk: { include: { room: { select: { roomNumber: true, name: true } } } },
      room: { select: { roomNumber: true, name: true } }
    },
    orderBy: { date: 'asc' }
  })
  res.json(bookings)
})

bookingsRouter.get('/', async (req, res) => {
  const { userId, date } = req.query
  const where: Record<string, unknown> = {}
  if (userId) where.userId = userId
  if (date && typeof date === 'string') {
    const start = new Date(date); start.setHours(0, 0, 0, 0)
    const end = new Date(date); end.setHours(23, 59, 59, 999)
    where.date = { gte: start, lte: end }
  }
  const bookings = await prisma.booking.findMany({
    where,
    include: {
      desk: { include: { room: { select: { roomNumber: true, name: true } } } },
      room: { select: { roomNumber: true, name: true } },
      user: { select: { name: true } }
    },
    orderBy: { date: 'asc' }
  })
  res.json(bookings)
})

const createSchema = z.object({
  userId: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format: YYYY-MM-DD'),
  deskId: z.string().optional(),
  roomId: z.string().optional()
}).refine(d => d.deskId || d.roomId, { message: 'deskId oder roomId erforderlich' })

bookingsRouter.post('/', async (req, res) => {
  const result = createSchema.safeParse(req.body)
  if (!result.success) return res.status(400).json({ error: result.error.flatten() })

  const { userId, date, deskId, roomId } = result.data
  const bookingDate = new Date(date); bookingDate.setHours(12, 0, 0, 0)

  try {
    if (roomId) {
      const existing = await prisma.booking.findFirst({
        where: { roomId, date: { gte: new Date(date + 'T00:00:00'), lte: new Date(date + 'T23:59:59') } }
      })
      if (existing) return res.status(409).json({ error: 'Besprechungsraum ist an diesem Tag bereits gebucht' })
    }
    const booking = await prisma.booking.create({
      data: { userId, date: bookingDate, deskId, roomId }
    })
    res.status(201).json(booking)
  } catch {
    res.status(409).json({ error: 'Dieser Platz ist an diesem Tag bereits gebucht' })
  }
})

bookingsRouter.delete('/:id', async (req, res) => {
  try {
    await prisma.booking.delete({ where: { id: req.params.id } })
    res.status(204).send()
  } catch {
    res.status(404).json({ error: 'Buchung nicht gefunden' })
  }
})
