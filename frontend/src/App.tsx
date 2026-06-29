import { useEffect, useState } from 'react'

export default function App() {
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading')

  useEffect(() => {
    fetch('/api/health')
      .then(r => r.json())
      .then(() => setStatus('ok'))
      .catch(() => setStatus('error'))
  }, [])

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h1>🏢 Room Booker</h1>
      <p>KiWi Tower – Platz­buchungs­system</p>
      <hr />
      <p>
        Backend:{' '}
        {status === 'loading' && '⏳ Verbinde...'}
        {status === 'ok' && '✅ Verbunden'}
        {status === 'error' && '❌ Nicht erreichbar – läuft das Backend?'}
      </p>
    </div>
  )
}
