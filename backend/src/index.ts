import express from 'express'
import cors from 'cors'
import { roomsRouter } from './routes/rooms'
import { bookingsRouter } from './routes/bookings'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api/rooms', roomsRouter)
app.use('/api/bookings', bookingsRouter)

app.listen(PORT, () => {
  console.log(`Backend läuft auf http://localhost:${PORT}`)
})
