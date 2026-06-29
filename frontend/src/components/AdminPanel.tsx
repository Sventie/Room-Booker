import { useState, useEffect } from 'react'
import type { Room } from '../types'

const ADMIN_PW = 'admin'

interface AdminBooking {
  id: string
  date: string
  user: { name: string }
  desk: { number: number; room: { roomNumber: string; name: string | null } } | null
  room: { roomNumber: string; name: string | null } | null
}

type RoomEdit = Partial<Pick<Room, 'name' | 'type' | 'deskCount' | 'active'>>

export default function AdminPanel() {
  const [authed, setAuthed] = useState(() => localStorage.getItem('rb-admin') === '1')
  const [pw, setPw] = useState('')
  const [pwError, setPwError] = useState(false)
  const [rooms, setRooms] = useState<Room[]>([])
  const [bookings, setBookings] = useState<AdminBooking[]>([])
  const [tab, setTab] = useState<'rooms' | 'bookings'>('rooms')
  const [edits, setEdits] = useState<Record<string, RoomEdit>>({})
  const [saving, setSaving] = useState<string | null>(null)
  const [cancelling, setCancelling] = useState<string | null>(null)

  function login(e: React.FormEvent) {
    e.preventDefault()
    if (pw === ADMIN_PW) { localStorage.setItem('rb-admin', '1'); setAuthed(true) }
    else { setPwError(true); setPw('') }
  }

  function logout() { localStorage.removeItem('rb-admin'); setAuthed(false) }

  function loadData() {
    fetch('/api/rooms?all=true').then(r => r.json()).then(setRooms)
    fetch('/api/bookings/all').then(r => r.json()).then(setBookings)
  }

  useEffect(() => { if (authed) loadData() }, [authed])

  function get<K extends keyof Room>(room: Room, key: K): Room[K] {
    return ((edits[room.id]?.[key as keyof RoomEdit] ?? room[key]) as Room[K])
  }

  function set(roomId: string, key: keyof RoomEdit, value: unknown) {
    setEdits(prev => ({ ...prev, [roomId]: { ...prev[roomId], [key]: value } }))
  }

  async function save(room: Room) {
    const changes = edits[room.id]
    if (!changes || Object.keys(changes).length === 0) return
    setSaving(room.id)
    await fetch(`/api/rooms/${room.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(changes)
    })
    setEdits(prev => { const n = { ...prev }; delete n[room.id]; return n })
    loadData()
    setSaving(null)
  }

  async function cancelBooking(id: string) {
    setCancelling(id)
    await fetch(`/api/bookings/${id}`, { method: 'DELETE' })
    setCancelling(null)
    setBookings(prev => prev.filter(b => b.id !== id))
  }

  if (!authed) {
    return (
      <div className="page-content">
        <div className="admin-login">
          <h2 className="page-title">Admin-Bereich</h2>
          <form onSubmit={login}>
            <input type="password" placeholder="Passwort" value={pw}
              onChange={e => { setPw(e.target.value); setPwError(false) }} autoFocus />
            {pwError && <p className="form-error">Falsches Passwort</p>}
            <button type="submit">Anmelden</button>
          </form>
        </div>
      </div>
    )
  }

  const today = new Date(); today.setHours(0, 0, 0, 0)
  const upcomingBookings = bookings.filter(b => new Date(b.date) >= today)

  return (
    <div className="page-content">
      <div className="admin-header">
        <h2 className="page-title">Admin-Panel</h2>
        <button className="logout-btn" style={{ color: '#555', borderColor: '#ccc', background: 'white' }} onClick={logout}>Abmelden</button>
      </div>

      <div className="admin-tabs">
        <button className={`admin-tab${tab === 'rooms' ? ' active' : ''}`} onClick={() => setTab('rooms')}>
          Räume ({rooms.length})
        </button>
        <button className={`admin-tab${tab === 'bookings' ? ' active' : ''}`} onClick={() => setTab('bookings')}>
          Buchungen ({upcomingBookings.length} kommend)
        </button>
      </div>

      {tab === 'rooms' && (
        <div>
          {[3, 4].map(floor => (
            <div key={floor}>
              <h3 className="section-title">{floor}. Obergeschoss</h3>
              <div className="admin-room-grid">
                {rooms.filter(r => r.floor === floor).map(room => {
                  const hasChanges = Object.keys(edits[room.id] ?? {}).length > 0
                  const active = get(room, 'active') as boolean
                  const type = get(room, 'type') as string
                  const deskCount = get(room, 'deskCount') as number
                  const name = get(room, 'name') as string | null
                  return (
                    <div key={room.id} className={`admin-room-card${!active ? ' admin-room-card--inactive' : ''}`}>
                      <div className="admin-room-top">
                        <strong>{room.roomNumber}</strong>
                        <span className="admin-room-wing">{room.wing === 'HUB' ? 'Zentral' : `Fl. ${room.wing}`}</span>
                      </div>
                      <div className="admin-fields">
                        <label>Name</label>
                        <input type="text" placeholder="(kein Name)" value={name ?? ''}
                          onChange={e => set(room.id, 'name', e.target.value || null)} />
                        <label>Typ</label>
                        <select value={type} onChange={e => set(room.id, 'type', e.target.value as Room['type'])}>
                          <option value="DESK_ROOM">Schreibtisch</option>
                          <option value="MEETING_ROOM">Besprechung</option>
                        </select>
                        {type === 'DESK_ROOM' && (
                          <>
                            <label>Plätze</label>
                            <input type="number" min={1} max={50} value={deskCount}
                              onChange={e => set(room.id, 'deskCount', parseInt(e.target.value))} />
                          </>
                        )}
                        <label>Aktiv</label>
                        <input type="checkbox" checked={active}
                          onChange={e => set(room.id, 'active', e.target.checked)} />
                      </div>
                      {hasChanges && (
                        <button className="btn-save" disabled={saving === room.id} onClick={() => save(room)}>
                          {saving === room.id ? 'Speichert…' : 'Speichern'}
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'bookings' && (
        <div>
          <h3 className="section-title">Alle kommenden Buchungen</h3>
          {upcomingBookings.length === 0 ? (
            <p className="empty-state">Keine kommenden Buchungen</p>
          ) : (
            <div className="booking-list">
              {upcomingBookings.map(b => (
                <div key={b.id} className="booking-item">
                  <div className="booking-info">
                    <span className="booking-date">
                      {new Date(b.date).toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </span>
                    <span className="booking-label">
                      <strong>{b.user.name}</strong> ·{' '}
                      {b.desk
                        ? `Raum ${b.desk.room.roomNumber}, Platz ${b.desk.number}`
                        : b.room ? `Raum ${b.room.roomNumber}${b.room.name ? ` (${b.room.name})` : ''}` : '–'}
                    </span>
                  </div>
                  <button className="btn-cancel" disabled={cancelling === b.id}
                    onClick={() => cancelBooking(b.id)}>
                    {cancelling === b.id ? '…' : 'Stornieren'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
