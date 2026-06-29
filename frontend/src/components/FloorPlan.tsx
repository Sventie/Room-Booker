import type { Room } from '../types'

interface Props {
  rooms: Room[]
  floor: number
  selectedRoom: Room | null
  onRoomClick: (room: Room) => void
}

const CX = 440
const CY = 335
const HUB_R = 78
const COL_W = 80
const ROW_H = 46
const GAP = 10
const PAD = 4

// Wing SVG rotation: without rotation the wing extends downward.
// rotate(180) → up (Wing B), rotate(60) → lower-left (Wing A), rotate(-60) → lower-right (Wing C)
const WINGS = [
  { id: 'A', rotate: 60 },
  { id: 'B', rotate: 180 },
  { id: 'C', rotate: -60 },
]

const LAYOUT: Record<number, Record<string, (string | null)[][] | null>> = {
  3: {
    A: [['3.40','3.41'],['3.42','3.43'],['3.44','3.45'],['3.46','3.47'],['3.48',null]],
    B: [['3.49','3.50'],['3.51','3.52'],['3.53','3.54'],['3.55','3.56'],['3.57',null]],
    C: [['3.58','3.59'],['3.60','3.61'],['3.62','3.63'],['3.64','3.65'],['3.66','3.67']],
  },
  4: {
    A: null,
    B: null,
    C: [['4.36','4.37'],['4.38','4.39'],['4.40','4.41'],['4.42','4.43'],['4.44',null]],
  },
}

function rotateAround(x: number, y: number, deg: number, cx: number, cy: number) {
  const r = (deg * Math.PI) / 180
  const dx = x - cx, dy = y - cy
  return {
    x: cx + dx * Math.cos(r) - dy * Math.sin(r),
    y: cy + dx * Math.sin(r) + dy * Math.cos(r),
  }
}

export default function FloorPlan({ rooms, floor, selectedRoom, onRoomClick }: Props) {
  const byNumber = Object.fromEntries(rooms.map(r => [r.roomNumber, r]))
  const floorLayout = LAYOUT[floor] ?? {}
  const WING_H = ROW_H * 5 + PAD
  const WING_W = COL_W * 2 + GAP

  // Collect rooms for second-pass text rendering
  const textItems: { roomNum: string; room: Room | undefined; cx: number; cy: number }[] = []

  WINGS.forEach(({ id, rotate }) => {
    const layout = floorLayout[id]
    if (!layout) return
    layout.forEach((row, ri) =>
      row.forEach((rn, ci) => {
        if (!rn) return
        const lx = ci === 0 ? CX - COL_W - GAP / 2 : CX + GAP / 2
        const ly = CY + HUB_R + PAD + ri * ROW_H
        const abs = rotateAround(lx + COL_W / 2, ly + ROW_H / 2, rotate, CX, CY)
        textItems.push({ roomNum: rn, room: byNumber[rn], cx: abs.x, cy: abs.y })
      })
    )
  })

  return (
    <svg viewBox="0 0 880 660" style={{ width: '100%', height: '100%' }}>
      {/* Wings (rects in rotated groups) */}
      {WINGS.map(({ id, rotate }) => {
        const layout = floorLayout[id]
        const isTerrace = layout === null || layout === undefined
        return (
          <g key={id} transform={`rotate(${rotate}, ${CX}, ${CY})`}>
            <rect
              x={CX - COL_W - GAP / 2} y={CY + HUB_R}
              width={WING_W} height={WING_H}
              fill={isTerrace ? '#dcedc8' : '#eceff1'}
              stroke={isTerrace ? '#aed581' : '#b0bec5'}
              strokeWidth={1.5} rx={5}
            />
            {!isTerrace && layout!.map((row, ri) =>
              row.map((rn, ci) => {
                if (!rn) return null
                const room = byNumber[rn]
                const rx = ci === 0 ? CX - COL_W - GAP / 2 : CX + GAP / 2
                const ry = CY + HUB_R + PAD + ri * ROW_H
                const isSelected = room?.id === selectedRoom?.id
                const fill = !room ? '#b0bec5'
                  : isSelected ? '#1565c0'
                  : room.type === 'MEETING_ROOM' ? '#7b1fa2'
                  : '#43a047'
                return (
                  <rect
                    key={rn}
                    x={rx + 1} y={ry + 1}
                    width={COL_W - 2} height={ROW_H - 2}
                    fill={fill}
                    stroke={isSelected ? '#0d47a1' : 'rgba(0,0,0,0.12)'}
                    strokeWidth={isSelected ? 2.5 : 1}
                    rx={3}
                    style={{ cursor: room ? 'pointer' : 'default' }}
                    onClick={() => room && onRoomClick(room)}
                  />
                )
              })
            )}
          </g>
        )
      })}

      {/* Hub on top */}
      <circle cx={CX} cy={CY} r={HUB_R} fill="#e3f2fd" stroke="#90caf9" strokeWidth={2} />
      <text x={CX} y={CY - 8} textAnchor="middle" fontSize={13} fill="#1565c0" fontWeight="700">Kern</text>
      <text x={CX} y={CY + 9} textAnchor="middle" fontSize={11} fill="#5c8bb0">{floor}. OG</text>

      {/* Room text at absolute positions (no rotation) */}
      {textItems.map(({ roomNum, room, cx, cy }) => (
        <g key={roomNum} style={{ pointerEvents: 'none' }}>
          <text x={cx} y={cy - 5} textAnchor="middle" dominantBaseline="middle"
            fontSize={10} fontWeight="600" fill={room ? 'white' : '#78909c'}>
            {roomNum}
          </text>
          {room && (
            <text x={cx} y={cy + 8} textAnchor="middle" dominantBaseline="middle"
              fontSize={8} fill="rgba(255,255,255,0.85)">
              {room.type === 'MEETING_ROOM' ? 'Besprechung' : `${room.deskCount} Pl.`}
            </text>
          )}
        </g>
      ))}

      {/* Terrace labels */}
      {WINGS.map(({ id, rotate }) => {
        const layout = floorLayout[id]
        if (layout !== null && layout !== undefined) return null
        const abs = rotateAround(CX, CY + HUB_R + WING_H / 2, rotate, CX, CY)
        return (
          <g key={id}>
            <text x={abs.x} y={abs.y - 7} textAnchor="middle" fontSize={12} fill="#558b2f" fontWeight="600">Dachterrasse</text>
            <text x={abs.x} y={abs.y + 10} textAnchor="middle" fontSize={10} fill="#7cb342">Flügel {id}</text>
          </g>
        )
      })}

      {/* Wing labels at tips */}
      {WINGS.map(({ id, rotate }) => {
        const layout = floorLayout[id]
        if (layout === null || layout === undefined) return null
        const abs = rotateAround(CX, CY + HUB_R + WING_H + 18, rotate, CX, CY)
        return (
          <text key={id} x={abs.x} y={abs.y} textAnchor="middle" fontSize={11} fill="#546e7a" fontWeight="700">
            Flügel {id}
          </text>
        )
      })}
    </svg>
  )
}
