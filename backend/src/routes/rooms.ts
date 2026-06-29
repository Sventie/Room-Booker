import { Router } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
export const roomsRouter = Router()

roomsRouter.get('/', async (_req, res) => {
  try {
    const rooms = await prisma.room.findMany({
      where: { active: true },
      include: { desks: { where: { active: true } } },
      orderBy: [{ floor: 'asc' }, { roomNumber: 'asc' }]
    })
    res.json(rooms)
  } catch (e) {
    res.status(500).json({ error: 'Datenbankfehler' })
  }
})

roomsRouter.get('/:id/availability', async (req, res) => {
  const { id } = req.params
  const { date } = req.query

  if (!date || typeof date !== 'string') {
    return res.status(400).json({ error: 'date Parameter erforderlich (YYYY-MM-DD)' })
  }

  const start = new Date(date)
  start.setHours(0, 0, 0, 0)
  const end = new Date(date)
  end.setHours(23, 59, 59, 999)

  try {
    const room = await prisma.room.findUnique({
      where: { id },
      include: {
        desks: {
          where: { active: true },
          include: {
            bookings: {
              where: { date: { gte: start, lte: end } },
              include: { user: { select: { name: true } } }
            }
          }
        },
        bookings: {
          where: { date: { gte: start, lte: end } },
          include: { user: { select: { name: true } } }
        }
      }
    })

    if (!room) return res.status(404).json({ error: 'Raum nicht gefunden' })
    res.json(room)
  } catch (e) {
    res.status(500).json({ error: 'Datenbankfehler' })
  }
})
