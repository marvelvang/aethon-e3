const APP_VERSION = '0.0.3'

export default function VersionDisplay() {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 12,
        left: 12,
        zIndex: 100,
        fontFamily: 'monospace',
        fontSize: 11,
        color: 'rgba(255,255,255,0.35)',
        letterSpacing: '0.04em',
        pointerEvents: 'none',
        userSelect: 'none',
      }}
    >
      v{APP_VERSION}
    </div>
  )
}
