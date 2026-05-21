import './VersionDisplay.css'

const APP_VERSION = '0.0.11'

export default function VersionDisplay() {
  return <div className="version-display">v{APP_VERSION}</div>
}
