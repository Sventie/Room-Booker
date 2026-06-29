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
    console.log(`  ✓ Raum ${created.roomNumber} (${room.deskCount} Plätze)`)
  }
  await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: { name: 'Demo Nutzer', email: 'demo@example.com' }
  })
  console.log('Seed abgeschlossen.')
}

main().catch(console.error).finally(() => prisma.$disconnect())
