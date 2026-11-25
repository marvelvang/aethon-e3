import { useRegisterSW } from 'virtual:pwa-register/react'
import './PwaUpdate.css'

export default function PwaUpdate() {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      if (r) {
        // poll for updates every 60 minutes
        setInterval(() => r.update(), 60 * 60 * 1000)
      }
    },
  })

  if (!needRefresh) return null

  return (
    <div className="pwa-update">
      <span>Neue Version verfügbar</span>
      <button onClick={() => updateServiceWorker(true)}>Jetzt aktualisieren</button>
    </div>
  )
}
