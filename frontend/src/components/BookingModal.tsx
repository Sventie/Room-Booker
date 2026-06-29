import { useState, useEffect } from 'react'
import type { Room } from '../types'

interface DeskWithBookings {
  id: string
  number: number
  label: string | null
  bookings: { user: { name: string } }[]
}

interface RoomAvailability extends Room {
  desks: DeskWithBookings[]
  bookings: { user: { name: string } }[]
}

interface Props {
  room: Room
  userId: string
  userName: string
  onClose: () => void
  onBooked: () => void
}

function toDateStr(d: Date) {
  return d.toISOString().split('T')[0]
}

function nextWorkday() {
  const d = new Date()
  while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() + 1)
  return toDateStr(d)
}

function isWeekend(dateStr: string) {
  const d = new Date(dateStr + 'T12:00:00')
  return d.getDay() === 0 || d.getDay() === 6
}

export default function BookingModal({ room, userId, userName, onClose, onBooked }: Props) {
  const [date, setDate] = useState(nextWorkday())
  const [avail, setAvail] = useState<RoomAvailability | null>(null)
  const [loadingAvail, setLoadingAvail] = useState(false)
  const [selectedDeskId, setSelectedDeskId] = useState<string | null>(null)
  const [booking, setBooking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!date || isWeekend(date)) return
    setLoadingAvail(true)
    setSelectedDeskId(null)
    setError(null)
    fetch(`/api/rooms/${room.id}/availability?date=${date}`)
      .then(r => r.json())
      .then(data => { setAvail(data); setLoadingAvail(false) })
      .catch(() => { setError('Verfügbarkeit konnte nicht geladen werden'); setLoadingAvail(false) })
  }, [date, room.id])

  async function handleBook(deskId?: string) {
    setBooking(true)
    setError(null)
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          date,
          deskId: deskId ?? undefined,
          roomId: !deskId ? room.id : undefined
        })
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Buchung fehlgeschlagen')
      }
      setSuccess(true)
      setTimeout(() => { onBooked(); onClose() }, 1500)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unbekannter Fehler')
    } finally {
      setBooking(false)
    }
  }

  const isMeeting = room.type === 'MEETING_ROOM'
  const roomBookedBy = avail?.bookings?.[0]?.user.name ?? null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>Raum {room.roomNumber}{room.name ? ` – ${room.name}` : ''}</h2>
            <span className={`badge ${isMeeting ? 'badge-meeting' : 'badge-desk'}`}>
              {isMeeting ? 'Besprechungsraum' : `${room.deskCount} Schreibtische`}
            </span>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="date-row">
            <label htmlFor="bdate">Datum</label>
            <input
              id="bdate" type="date" value={date}
              min={toDateStr(new Date())}
              onChange={e => { setDate(e.target.value); setSuccess(false) }}
            />
            {isWeekend(date) && <span className="weekend-warn">Wochenende – kein Buchungstag</span>}
          </div>

          {success && <div className="booking-success">✓ Buchung erfolgreich!</div>}
          {error && <div className="booking-error">{error}</div>}

          {!success && !isWeekend(date) && (
            <>
              {loadingAvail && <p className="loading-text">Lade Verfügbarkeit…</p>}

              {!loadingAvail && avail && isMeeting && (
                <div className="meeting-avail">
                  {roomBookedBy ? (
                    <div className="avail-status avail-booked">
                      <span className="avail-dot" />
                      <span>Belegt von <strong>{roomBookedBy}</strong></span>
                    </div>
                  ) : (
                    <div className="avail-status avail-free">
                      <span className="avail-dot" />
                      <span>Verfügbar</span>
                    </div>
                  )}
                  {!roomBookedBy && (
                    <button className="btn-book" disabled={booking} onClick={() => handleBook()}>
                      {booking ? 'Wird gebucht…' : 'Raum buchen'}
                    </button>
                  )}
                </div>
              )}

              {!loadingAvail && avail && !isMeeting && (
                <>
                  <p className="desk-hint">
                    {avail.desks.filter(d => !d.bookings.length).length} von {avail.desks.length} Plätzen frei
                  </p>
                  <div className="desk-grid">
                    {avail.desks.map(desk => {
                      const bookedBy = desk.bookings[0]?.user.name
                      const isBooked = !!bookedBy
                      const isSelected = selectedDeskId === desk.id
                      const isMine = bookedBy === userName
                      return (
                        <button
                          key={desk.id}
                          disabled={isBooked}
                          className={`desk-btn${isBooked ? ' desk-btn--booked' : ''}${isSelected ? ' desk-btn--selected' : ''}`}
                          onClick={() => !isBooked && setSelectedDeskId(isSelected ? null : desk.id)}
                          title={bookedBy ? `Gebucht von ${bookedBy}` : ''}
                        >
                          <span className="desk-num">{desk.label ?? `Platz ${desk.number}`}</span>
                          {isBooked && <span className="desk-who">{isMine ? 'Ich' : bookedBy}</span>}
                        </button>
                      )
                    })}
                  </div>
                  {selectedDeskId && (
                    <button className="btn-book" disabled={booking} onClick={() => handleBook(selectedDeskId)}>
                      {booking ? 'Wird gebucht…' : 'Platz buchen'}
                    </button>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
