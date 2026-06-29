import { useState } from 'react'

interface User { id: string; name: string; email: string }

interface Props {
  onSetup: (user: User) => void
}

export default function UserSetup({ onSetup }: Props) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !email.trim()) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/users/me', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim().toLowerCase() })
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
      <p>Bitte gib deinen Namen und deine E-Mail ein, um Plätze zu buchen.</p>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Name" value={name} onChange={e => setName(e.target.value)} required />
        <input type="email" placeholder="E-Mail" value={email} onChange={e => setEmail(e.target.value)} required />
        {error && <p className="form-error">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? 'Wird eingerichtet…' : 'Starten'}
        </button>
      </form>
    </div>
  )
}
