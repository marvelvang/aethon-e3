import { type ReactNode } from 'react'
import './ConfirmDialog.css'

interface Props {
  icon?: ReactNode
  title: string
  message: string
  confirmLabel: string
  cancelLabel?: string
  hideCancelButton?: boolean
  isWorking?: boolean
  variant?: 'danger' | 'default'
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({
  icon,
  title,
  message,
  confirmLabel,
  cancelLabel = 'Abbrechen',
  hideCancelButton = false,
  isWorking = false,
  variant = 'default',
  onConfirm,
  onCancel,
}: Props) {
  return (
    <div
      className="confirm-backdrop"
      onClick={() => !isWorking && !hideCancelButton && onCancel()}
    >
      <div
        className="confirm-panel"
        onClick={(e) => e.stopPropagation()}
      >
        {icon && <div className="confirm-icon">{icon}</div>}
        <div className="confirm-title">{title}</div>
        <div className="confirm-message">{message}</div>
        <div className="confirm-buttons">
          {!hideCancelButton && (
            <button
              onClick={onCancel}
              disabled={isWorking}
              className="confirm-btn confirm-btn-cancel"
            >
              {cancelLabel}
            </button>
          )}
          <button
            onClick={onConfirm}
            disabled={isWorking}
            className={`confirm-btn ${variant === 'danger' ? 'confirm-btn-danger' : 'confirm-btn-primary'}`}
          >
            {isWorking ? '…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
