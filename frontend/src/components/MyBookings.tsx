import { useState, useEffect, useCallback } from 'react'

interface BookingItem {
  id: string
  date: string
  desk: { number: number; label: string | null; room: { roomNumber: string; name: string | null } } | null
  room: { roomNumber: string; name: string | null } | null
}

interface Props {
  userId: string
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('de-DE', {
    weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric'
  })
}

function bookingLabel(b: BookingItem) {
  if (b.desk) {
    const r = b.desk.room
    return `Raum ${r.roomNumber}${r.name ? ` – ${r.name}` : ''} · ${b.desk.label ?? `Platz ${b.desk.number}`}`
  }
  if (b.room) return `Raum ${b.room.roomNumber}${b.room.name ? ` – ${b.room.name}` : ''} · Besprechungsraum`
  return '–'
}

export default function MyBookings({ userId }: Props) {
  const [bookings, setBookings] = useState<BookingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState<string | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    fetch(`/api/bookings?userId=${userId}`)
      .then(r => r.json())
      .then(data => { setBookings(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [userId])

  useEffect(() => { load() }, [load])

  async function handleCancel(id: string) {
    setCancelling(id)
    await fetch(`/api/bookings/${id}`, { method: 'DELETE' })
    setCancelling(null)
    load()
  }

  const today = new Date(); today.setHours(0, 0, 0, 0)
  const upcoming = bookings.filter(b => new Date(b.date) >= today)
  const past = bookings.filter(b => new Date(b.date) < today).reverse()

  return (
    <div className="page-content">
      <h2 className="page-title">Meine Buchungen</h2>

      {loading ? (
        <p className="loading-text">Lädt…</p>
      ) : (
        <>
          <section>
            <h3 className="section-title">Kommende Buchungen</h3>
            {upcoming.length === 0 ? (
              <p className="empty-state">Keine kommenden Buchungen</p>
            ) : (
              <div className="booking-list">
                {upcoming.map(b => (
                  <div key={b.id} className="booking-item">
                    <div className="booking-info">
                      <span className="booking-date">{formatDate(b.date)}</span>
                      <span className="booking-label">{bookingLabel(b)}</span>
                    </div>
                    <button className="btn-cancel" disabled={cancelling === b.id}
                      onClick={() => handleCancel(b.id)}>
                      {cancelling === b.id ? '…' : 'Stornieren'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {past.length > 0 && (
            <section>
              <h3 className="section-title">Vergangene Buchungen</h3>
              <div className="booking-list">
                {past.map(b => (
                  <div key={b.id} className="booking-item booking-item--past">
                    <div className="booking-info">
                      <span className="booking-date">{formatDate(b.date)}</span>
                      <span className="booking-label">{bookingLabel(b)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}
