import type { Room } from '../types'

interface RoomDot {
  roomNumber: string
  cx: number
  cy: number
}

// Koordinaten aus den Vektortexten der 3. OG SVG (viewBox: 3401.5732 x 2245.04)
const FLOOR3_DOTS: RoomDot[] = [
  // Flügel A (lower left)
  { roomNumber: '3.40', cx: 1015, cy: 1554 },
  { roomNumber: '3.41', cx: 896,  cy: 1458 },
  { roomNumber: '3.42', cx: 730,  cy: 1550 },
  { roomNumber: '3.43', cx: 612,  cy: 1617 },
  { roomNumber: '3.44', cx: 494,  cy: 1722 },
  { roomNumber: '3.45', cx: 608,  cy: 1914 },
  { roomNumber: '3.46', cx: 773,  cy: 1846 },
  { roomNumber: '3.47', cx: 903,  cy: 1798 },
  { roomNumber: '3.48', cx: 1061, cy: 1716 },
  // Flügel B (top)
  { roomNumber: '3.49', cx: 1418, cy: 827 },
  { roomNumber: '3.50', cx: 1275, cy: 825 },
  { roomNumber: '3.51', cx: 1273, cy: 646 },
  { roomNumber: '3.52', cx: 1270, cy: 502 },
  { roomNumber: '3.53', cx: 1273, cy: 326 },
  { roomNumber: '3.54', cx: 1574, cy: 326 },
  { roomNumber: '3.55', cx: 1574, cy: 502 },
  { roomNumber: '3.56', cx: 1574, cy: 646 },
  { roomNumber: '3.57', cx: 1574, cy: 819 },
  // Flügel C (lower right)
  { roomNumber: '3.58', cx: 1823, cy: 1552 },
  { roomNumber: '3.59', cx: 1945, cy: 1435 },
  { roomNumber: '3.60', cx: 2170, cy: 1547 },
  { roomNumber: '3.61', cx: 2331, cy: 1648 },
  { roomNumber: '3.62', cx: 2435, cy: 1695 },
  { roomNumber: '3.63', cx: 2115, cy: 1720 },
  { roomNumber: '3.64', cx: 2204, cy: 1948 },
  { roomNumber: '3.65', cx: 2028, cy: 1860 },
  { roomNumber: '3.66', cx: 1946, cy: 1802 },
  { roomNumber: '3.67', cx: 1783, cy: 1710 },
]

// Koordinaten geschätzt aus dem Raster-Bild der 4. OG SVG (viewBox: 2551.2 x 1683.84)
const FLOOR4_DOTS: RoomDot[] = [
  // Zentralbereich (Kreisring)
  { roomNumber: '4.12', cx: 728,  cy: 868 },
  { roomNumber: '4.16', cx: 619,  cy: 727 },
  { roomNumber: '4.17', cx: 677,  cy: 651 },
  { roomNumber: '4.18', cx: 740,  cy: 574 },
  { roomNumber: '4.20', cx: 893,  cy: 542 },
  { roomNumber: '4.22', cx: 1060, cy: 570 },
  { roomNumber: '4.23', cx: 1060, cy: 648 },
  // Flügel C (grauer Bereich, unten rechts)
  { roomNumber: '4.36', cx: 1200, cy: 735 },
  { roomNumber: '4.37', cx: 1390, cy: 773 },
  { roomNumber: '4.38', cx: 1600, cy: 818 },
  { roomNumber: '4.39', cx: 1820, cy: 860 },
  { roomNumber: '4.40', cx: 1660, cy: 1060 },
  { roomNumber: '4.41', cx: 1840, cy: 1040 },
  { roomNumber: '4.42', cx: 1120, cy: 980 },
  { roomNumber: '4.43', cx: 1145, cy: 848 },
  { roomNumber: '4.44', cx: 1380, cy: 895 },
]

const FLOOR_CONFIG: Record<number, { viewBox: string; dots: RoomDot[]; r: number }> = {
  3: { viewBox: '0 0 3401.5732 2245.04', dots: FLOOR3_DOTS, r: 90 },
  4: { viewBox: '0 0 2551.2 1683.84',   dots: FLOOR4_DOTS, r: 70 },
}

interface Props {
  rooms: Room[]
  floor: number
  selectedRoom: Room | null
  onRoomClick: (room: Room) => void
}

export default function FloorPlan({ rooms, floor, selectedRoom, onRoomClick }: Props) {
  const config = FLOOR_CONFIG[floor]
  if (!config) return null

  const byNumber = Object.fromEntries(rooms.map(r => [r.roomNumber, r]))

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <img
        src={`/floor${floor}.svg`}
        alt={`Grundriss ${floor}. Obergeschoss`}
        style={{ width: '100%', display: 'block' }}
        draggable={false}
      />
      <svg
        viewBox={config.viewBox}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        preserveAspectRatio="xMidYMid meet"
      >
        {config.dots.map(({ roomNumber, cx, cy }) => {
          const room = byNumber[roomNumber]
          if (!room) return null

          const isSelected = selectedRoom?.id === room.id
          const isMeeting = room.type === 'MEETING_ROOM'
          const r = config.r
          const fill = isSelected ? '#1565c0' : isMeeting ? '#7b1fa2' : '#2e7d32'

          return (
            <g key={roomNumber} onClick={() => onRoomClick(room)} style={{ cursor: 'pointer' }}>
              <circle
                cx={cx} cy={cy} r={r}
                fill={fill}
                fillOpacity={isSelected ? 0.95 : 0.85}
                stroke="white"
                strokeWidth={isSelected ? 6 : 3}
              />
              <text
                x={cx} y={cy - r * 0.12}
                textAnchor="middle" dominantBaseline="middle"
                fontSize={r * 0.5} fontWeight="700" fill="white"
              >
                {roomNumber}
              </text>
              <text
                x={cx} y={cy + r * 0.42}
                textAnchor="middle" dominantBaseline="middle"
                fontSize={r * 0.35} fill="rgba(255,255,255,0.9)"
              >
                {isMeeting ? 'Bespr.' : `${room.deskCount} Pl.`}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
