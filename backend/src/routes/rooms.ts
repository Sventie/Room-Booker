import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()
export const roomsRouter = Router()

roomsRouter.get('/', async (req, res) => {
  const showAll = req.query.all === 'true'
  try {
    const rooms = await prisma.room.findMany({
      where: showAll ? {} : { active: true },
      include: { desks: { where: showAll ? {} : { active: true } } },
      orderBy: [{ floor: 'asc' }, { wing: 'asc' }, { roomNumber: 'asc' }]
    })
    res.json(rooms)
  } catch {
    res.status(500).json({ error: 'Datenbankfehler' })
  }
})

roomsRouter.get('/:id/availability', async (req, res) => {
  const { id } = req.params
  const { date } = req.query
  if (!date || typeof date !== 'string')
    return res.status(400).json({ error: 'date Parameter erforderlich (YYYY-MM-DD)' })

  const start = new Date(date); start.setHours(0, 0, 0, 0)
  const end = new Date(date); end.setHours(23, 59, 59, 999)

  try {
    const room = await prisma.room.findUnique({
      where: { id },
      include: {
        desks: {
          where: { active: true },
          orderBy: { number: 'asc' },
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
  } catch {
    res.status(500).json({ error: 'Datenbankfehler' })
  }
})

const updateSchema = z.object({
  name: z.string().nullable().optional(),
  type: z.enum(['DESK_ROOM', 'MEETING_ROOM']).optional(),
  deskCount: z.number().int().min(1).max(50).optional(),
  active: z.boolean().optional(),
})

roomsRouter.put('/:id', async (req, res) => {
  const result = updateSchema.safeParse(req.body)
  if (!result.success) return res.status(400).json({ error: result.error.flatten() })

  const { name, type, deskCount, active } = result.data
  try {
    const room = await prisma.room.findUnique({
      where: { id: req.params.id },
      include: { desks: { orderBy: { number: 'asc' } } }
    })
    if (!room) return res.status(404).json({ error: 'Raum nicht gefunden' })

    if (deskCount !== undefined) {
      const activeDesks = room.desks.filter(d => d.active)
      if (deskCount > activeDesks.length) {
        const toAdd = deskCount - activeDesks.length
        const maxNum = room.desks.reduce((m, d) => Math.max(m, d.number), 0)
        await prisma.desk.createMany({
          data: Array.from({ length: toAdd }, (_, i) => ({
            roomId: room.id, number: maxNum + i + 1, active: true
          }))
        })
      } else if (deskCount < activeDesks.length) {
        const toDeactivate = activeDesks.slice(deskCount).map(d => d.id)
        await prisma.desk.updateMany({
          where: { id: { in: toDeactivate } },
          data: { active: false }
        })
      }
    }

    const updated = await prisma.room.update({
      where: { id: req.params.id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(type !== undefined ? { type } : {}),
        ...(deskCount !== undefined ? { deskCount } : {}),
        ...(active !== undefined ? { active } : {}),
      },
      include: { desks: true }
    })
    res.json(updated)
  } catch {
    res.status(500).json({ error: 'Datenbankfehler' })
  }
})
