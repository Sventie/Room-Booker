import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const wingRooms = [
  // 3. OG – Flügel A
  { roomNumber: '3.40', floor: 3, wing: 'A', deskCount: 6 },
  { roomNumber: '3.41', floor: 3, wing: 'A', deskCount: 6 },
  { roomNumber: '3.42', floor: 3, wing: 'A', deskCount: 4 },
  { roomNumber: '3.43', floor: 3, wing: 'A', deskCount: 3 },
  { roomNumber: '3.44', floor: 3, wing: 'A', deskCount: 5 },
  { roomNumber: '3.45', floor: 3, wing: 'A', deskCount: 5 },
  { roomNumber: '3.46', floor: 3, wing: 'A', deskCount: 4 },
  { roomNumber: '3.47', floor: 3, wing: 'A', deskCount: 4 },
  { roomNumber: '3.48', floor: 3, wing: 'A', deskCount: 4 },
  // 3. OG – Flügel B
  { roomNumber: '3.49', floor: 3, wing: 'B', deskCount: 6 },
  { roomNumber: '3.50', floor: 3, wing: 'B', deskCount: 4 },
  { roomNumber: '3.51', floor: 3, wing: 'B', deskCount: 4 },
  { roomNumber: '3.52', floor: 3, wing: 'B', deskCount: 4 },
  { roomNumber: '3.53', floor: 3, wing: 'B', deskCount: 5 },
  { roomNumber: '3.54', floor: 3, wing: 'B', deskCount: 5 },
  { roomNumber: '3.55', floor: 3, wing: 'B', deskCount: 4 },
  { roomNumber: '3.56', floor: 3, wing: 'B', deskCount: 4 },
  { roomNumber: '3.57', floor: 3, wing: 'B', deskCount: 4 },
  // 3. OG – Flügel C
  { roomNumber: '3.58', floor: 3, wing: 'C', deskCount: 2 },
  { roomNumber: '3.59', floor: 3, wing: 'C', deskCount: 8 },
  { roomNumber: '3.60', floor: 3, wing: 'C', deskCount: 4 },
  { roomNumber: '3.61', floor: 3, wing: 'C', deskCount: 4 },
  { roomNumber: '3.62', floor: 3, wing: 'C', deskCount: 3 },
  { roomNumber: '3.63', floor: 3, wing: 'C', deskCount: 4 },
  { roomNumber: '3.64', floor: 3, wing: 'C', deskCount: 7 },
  { roomNumber: '3.65', floor: 3, wing: 'C', deskCount: 3 },
  { roomNumber: '3.66', floor: 3, wing: 'C', deskCount: 3 },
  { roomNumber: '3.67', floor: 3, wing: 'C', deskCount: 6 },
  // 4. OG – Flügel C (A + B sind Dachterrassen)
  { roomNumber: '4.36', floor: 4, wing: 'C', deskCount: 6 },
  { roomNumber: '4.37', floor: 4, wing: 'C', deskCount: 3 },
  { roomNumber: '4.38', floor: 4, wing: 'C', deskCount: 4 },
  { roomNumber: '4.39', floor: 4, wing: 'C', deskCount: 7 },
  { roomNumber: '4.40', floor: 4, wing: 'C', deskCount: 5 },
  { roomNumber: '4.41', floor: 4, wing: 'C', deskCount: 4 },
  { roomNumber: '4.42', floor: 4, wing: 'C', deskCount: 4 },
  { roomNumber: '4.43', floor: 4, wing: 'C', deskCount: 4 },
  { roomNumber: '4.44', floor: 4, wing: 'C', deskCount: 5 },
]

const hubRooms = [
  // 4. OG – Zentralbereich (Hauptgebäude)
  { roomNumber: '4.12', name: 'Forum',     floor: 4, wing: 'HUB', type: 'MEETING_ROOM', deskCount: 0, area: 65.37 },
  { roomNumber: '4.16', name: null,        floor: 4, wing: 'HUB', type: 'DESK_ROOM',    deskCount: 2, area: 10.88 },
  { roomNumber: '4.17', name: null,        floor: 4, wing: 'HUB', type: 'DESK_ROOM',    deskCount: 8, area: 45.59 },
  { roomNumber: '4.18', name: null,        floor: 4, wing: 'HUB', type: 'DESK_ROOM',    deskCount: 5, area: 30.09 },
  { roomNumber: '4.20', name: 'Bellevue',  floor: 4, wing: 'HUB', type: 'MEETING_ROOM', deskCount: 0, area: 28.32 },
  { roomNumber: '4.22', name: 'Seegarten', floor: 4, wing: 'HUB', type: 'MEETING_ROOM', deskCount: 0, area: 20.61 },
  { roomNumber: '4.23', name: null,        floor: 4, wing: 'HUB', type: 'DESK_ROOM',    deskCount: 8, area: 43.54 },
]

async function main() {
  console.log('Seed: Räume und Schreibtische werden angelegt…')

  for (const room of wingRooms) {
    const svgId = `room-${room.roomNumber.replace('.', '-')}`
    const created = await prisma.room.upsert({
      where: { roomNumber: room.roomNumber },
      update: {},
      create: {
        roomNumber: room.roomNumber,
        floor: room.floor,
        wing: room.wing,
        deskCount: room.deskCount,
        svgId,
        desks: {
          create: Array.from({ length: room.deskCount }, (_, i) => ({ number: i + 1 }))
        }
      }
    })
    console.log(`  ✓ Flügel ${room.wing} Raum ${created.roomNumber} (${room.deskCount} Plätze)`)
  }

  for (const room of hubRooms) {
    const svgId = `room-${room.roomNumber.replace('.', '-')}`
    const created = await prisma.room.upsert({
      where: { roomNumber: room.roomNumber },
      update: {},
      create: {
        roomNumber: room.roomNumber,
        name: room.name,
        floor: room.floor,
        wing: room.wing,
        type: room.type,
        deskCount: room.deskCount,
        svgId,
        desks: room.type === 'DESK_ROOM'
          ? { create: Array.from({ length: room.deskCount }, (_, i) => ({ number: i + 1 })) }
          : undefined
      }
    })
    const label = room.name ? `${room.name} (${room.roomNumber})` : `Raum ${room.roomNumber}`
    console.log(`  ✓ Zentralbereich ${label} – ${room.type}`)
  }

  await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: { name: 'Demo Nutzer', email: 'demo@example.com' }
  })

  console.log('Seed abgeschlossen.')
}

main().catch(console.error).finally(() => prisma.$disconnect())
