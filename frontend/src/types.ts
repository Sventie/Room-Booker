export type RoomType = 'DESK_ROOM' | 'MEETING_ROOM'

export interface Desk {
  id: string
  number: number
  label: string | null
  active: boolean
}

export interface Room {
  id: string
  roomNumber: string
  name: string | null
  floor: number
  wing: string
  type: RoomType
  deskCount: number
  svgId: string
  desks: Desk[]
  active: boolean
}
