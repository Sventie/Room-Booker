import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()
export const usersRouter = Router()

const meSchema = z.object({
  name: z.string().min(1).max(100)
})

usersRouter.post('/me', async (req, res) => {
  const result = meSchema.safeParse(req.body)
  if (!result.success) return res.status(400).json({ error: result.error.flatten() })

  const { name } = result.data
  try {
    const user = await prisma.user.upsert({
      where: { name },
      update: {},
      create: { name }
    })
    res.json(user)
  } catch {
    res.status(500).json({ error: 'Datenbankfehler' })
  }
})
