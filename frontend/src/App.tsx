import { useState, useEffect } from 'react'
import type { Room } from './types'
import FloorPlan from './components/FloorPlan'
import BookingModal from './components/BookingModal'
import UserSetup from './components/UserSetup'
import MyBookings from './components/MyBookings'
import AdminPanel from './components/AdminPanel'

interface CurrentUser { id: string; name: string }
type Page = 'plan' | 'my-bookings' | 'admin'

export default function App() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [floor, setFloor] = useState(3)
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [bookingRoom, setBookingRoom] = useState<Room | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState<Page>('plan')
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(() => {
    const s = localStorage.getItem('room-booker-user')
    return s ? JSON.parse(s) : null
  })

  useEffect(() => {
    fetch('/api/rooms')
      .then(r => { if (!r.ok) throw new Error('Backend nicht erreichbar'); return r.json() })
      .then((data: Room[]) => { setRooms(data); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [])

  const floorRooms = rooms.filter(r => r.floor === floor)

  function handleRoomClick(room: Room) {
    setSelectedRoom(room)
    if (currentUser) setBookingRoom(room)
  }

  function handleLogout() {
    localStorage.removeItem('room-booker-user')
    setCurrentUser(null); setSelectedRoom(null); setBookingRoom(null); setPage('plan')
  }

  return (
    <div className="app">
      <header className="header">
        <h1>Room Booker · KiWi Tower Kiel</h1>
        <nav className="header-nav">
          <button className={`nav-btn${page === 'plan' ? ' active' : ''}`} onClick={() => setPage('plan')}>Grundriss</button>
          {currentUser && (
            <button className={`nav-btn${page === 'my-bookings' ? ' active' : ''}`} onClick={() => setPage('my-bookings')}>Meine Buchungen</button>
          )}
          <button className={`nav-btn${page === 'admin' ? ' active' : ''}`} onClick={() => setPage('admin')}>Admin</button>
        </nav>
        {currentUser && (
          <div className="header-user">
            <span>{currentUser.name}</span>
            <button className="logout-btn" onClick={handleLogout}>Abmelden</button>
          </div>
        )}
      </header>

      {page === 'my-bookings' && currentUser && <MyBookings userId={currentUser.id} />}
      {page === 'admin' && <AdminPanel />}

      {page === 'plan' && (
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
              <div className="legend-item"><div className="legend-dot" style={{ background: '#2e7d32' }} /> Schreibtischraum</div>
              <div className="legend-item"><div className="legend-dot" style={{ background: '#7b1fa2' }} /> Besprechungsraum</div>
              <div className="legend-item"><div className="legend-dot" style={{ background: '#1565c0' }} /> Ausgewählt</div>
            </div>
            <div className="plan-container">
              {loading && <p style={{ color: '#888' }}>Räume werden geladen…</p>}
              {error && <p style={{ color: '#c62828' }}>Fehler: {error}</p>}
              {!loading && !error && (
                <FloorPlan rooms={floorRooms} floor={floor} selectedRoom={selectedRoom} onRoomClick={handleRoomClick} />
              )}
            </div>
          </div>

          <aside className="sidebar">
            {!currentUser ? (
              <UserSetup onSetup={setCurrentUser} />
            ) : selectedRoom ? (
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
                <button className="btn-open-booking" onClick={() => setBookingRoom(selectedRoom)}>Platz buchen</button>
              </div>
            ) : (
              <p className="empty-state">Raum anklicken für Details</p>
            )}
          </aside>
        </div>
      )}

      {bookingRoom && currentUser && (
        <BookingModal room={bookingRoom} userId={currentUser.id} userName={currentUser.name}
          onClose={() => setBookingRoom(null)} onBooked={() => setBookingRoom(null)} />
      )}
    </div>
  )
}
