import './ConfirmModal.css';

export default function ConfirmModal({ isOpen, title, message, confirmLabel, confirmColor, onConfirm, onCancel, icon }) {
  if (!isOpen) return null;
  return (
    <div className="confirm-overlay" onClick={onCancel}>
      <div className="confirm-modal" onClick={e => e.stopPropagation()}>
        <div className="confirm-icon">{icon || '❓'}</div>
        <h3 className="confirm-title">{title}</h3>
        {message && <p className="confirm-message">{message}</p>}
        <div className="confirm-actions">
          <button
            className="confirm-btn confirm-btn-yes"
            style={{ background: confirmColor || 'var(--danger)' }}
            onClick={onConfirm}
          >
            {confirmLabel || 'Yes, proceed'}
          </button>
          <button className="confirm-btn confirm-btn-no" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}