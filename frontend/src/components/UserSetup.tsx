import { useState } from 'react'

interface User { id: string; name: string }

interface Props {
  onSetup: (user: User) => void
}

export default function UserSetup({ onSetup }: Props) {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/users/me', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() })
      })
      if (!res.ok) throw new Error('Fehler beim Einrichten')
      const user: User = await res.json()
      localStorage.setItem('room-booker-user', JSON.stringify(user))
      onSetup(user)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unbekannter Fehler')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="user-setup">
      <h3>Willkommen</h3>
      <p>Gib deinen Namen ein, um Plätze zu buchen.</p>
      <form onSubmit={handleSubmit}>
        <input
          type="text" placeholder="Dein Name"
          value={name} onChange={e => setName(e.target.value)}
          required autoFocus
        />
        {error && <p className="form-error">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? 'Wird eingerichtet…' : 'Starten'}
        </button>
      </form>
    </div>
  )
}
