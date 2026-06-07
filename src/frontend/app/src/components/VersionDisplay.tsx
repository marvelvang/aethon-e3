import './VersionDisplay.css'
import { APP_VERSION } from '../version'

interface VersionDisplayProps {
  backendVersion?: string
}

export default function VersionDisplay({ backendVersion }: VersionDisplayProps) {
  return (
    <div className="version-display">
      <span className="version-frontend">v{APP_VERSION}</span>
      {backendVersion && (
        <span className="version-backend">v{backendVersion}</span>
      )}
    </div>
  )
}
