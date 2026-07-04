import './VersionDisplay.css'
import { APP_VERSION, APP_BUILD } from '../version'

interface VersionDisplayProps {
  backendVersion?: string
}

export default function VersionDisplay({ backendVersion }: VersionDisplayProps) {
  return (
    <div className="version-display">
      <span className="version-frontend">v{APP_VERSION} <span className="version-build">#{APP_BUILD}</span></span>
      {backendVersion && (
        <span className="version-backend">v{backendVersion}</span>
      )}
    </div>
  )
}
