import { useEffect, useState } from 'react'
import type { Room } from './types'
import FloorPlan from './components/FloorPlan'

export default function App() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [floor, setFloor] = useState(3)
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/rooms')
      .then(r => { if (!r.ok) throw new Error('Backend nicht erreichbar'); return r.json() })
      .then((data: Room[]) => { setRooms(data); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [])

  const floorRooms = rooms.filter(r => r.floor === floor)
  const wingRooms = floorRooms.filter(r => r.wing !== 'HUB')
  const hubRooms = floorRooms.filter(r => r.wing === 'HUB')

  return (
    <div className="app">
      <header className="header">
        <h1>Room Booker · KiWi Tower Kiel</h1>
      </header>

      <div className="main">
        <div className="plan-area">
          <div className="floor-tabs">
            {[3, 4].map(f => (
              <button key={f} className={`floor-tab${floor === f ? ' active' : ''}`}
                onClick={() => { setFloor(f); setSelectedRoom(null) }}>
                {f}. Obergeschoss
              </button>
            ))}
          </div>

          <div className="legend">
            <div className="legend-item"><div className="legend-dot" style={{ background: '#43a047' }} /> Schreibtischraum</div>
            <div className="legend-item"><div className="legend-dot" style={{ background: '#7b1fa2' }} /> Besprechungsraum</div>
            <div className="legend-item"><div className="legend-dot" style={{ background: '#1565c0' }} /> Ausgewählt</div>
            <div className="legend-item"><div className="legend-dot" style={{ background: '#dcedc8', border: '1px solid #aed581' }} /> Dachterrasse</div>
          </div>

          <div className="plan-container">
            {loading && <p style={{ color: '#888' }}>Räume werden geladen…</p>}
            {error && <p style={{ color: '#c62828' }}>Fehler: {error}</p>}
            {!loading && !error && (
              <FloorPlan
                rooms={wingRooms}
                floor={floor}
                selectedRoom={selectedRoom}
                onRoomClick={setSelectedRoom}
              />
            )}
          </div>

          {hubRooms.length > 0 && (
            <div className="hub-section">
              <h3 className="hub-title">Zentralbereich</h3>
              <div className="hub-grid">
                {hubRooms.map(room => {
                  const isSelected = selectedRoom?.id === room.id
                  const isMeeting = room.type === 'MEETING_ROOM'
                  return (
                    <button
                      key={room.id}
                      className={`hub-room${isSelected ? ' hub-room--selected' : ''} ${isMeeting ? 'hub-room--meeting' : 'hub-room--desk'}`}
                      onClick={() => setSelectedRoom(room)}
                    >
                      <span className="hub-room-number">{room.roomNumber}</span>
                      {room.name && <span className="hub-room-name">{room.name}</span>}
                      <span className="hub-room-type">{isMeeting ? 'Besprechung' : `${room.deskCount} Pl.`}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        <aside className="sidebar">
          {selectedRoom ? (
            <div className="room-card">
              <h2>Raum {selectedRoom.roomNumber}</h2>
              {selectedRoom.name && (
                <p style={{ fontSize: '0.9rem', color: '#444', marginBottom: '0.4rem', fontWeight: 600 }}>{selectedRoom.name}</p>
              )}
              <span className={`badge ${selectedRoom.type === 'MEETING_ROOM' ? 'badge-meeting' : 'badge-desk'}`}>
                {selectedRoom.type === 'MEETING_ROOM' ? 'Besprechungsraum' : 'Schreibtischraum'}
              </span>
              <div className="detail-row"><span>Etage</span><span>{selectedRoom.floor}. OG</span></div>
              <div className="detail-row">
                <span>Bereich</span>
                <span>{selectedRoom.wing === 'HUB' ? 'Zentralbereich' : `Flügel ${selectedRoom.wing}`}</span>
              </div>
              {selectedRoom.type === 'DESK_ROOM' && (
                <div className="detail-row"><span>Buchbare Plätze</span><span>{selectedRoom.deskCount}</span></div>
              )}
              <p className="hint">Buchungs-Dialog folgt in Issue #6.</p>
            </div>
          ) : (
            <p className="empty-state">Raum im Grundriss oder Zentralbereich anklicken</p>
          )}
        </aside>
      </div>
    </div>
  )
}
