import { useEffect, useRef } from 'react';

interface Props {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'danger' | 'warning';
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  onConfirm,
  onCancel,
}: Props) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  // lock body scroll while open, restore on unmount
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    // focus confirm button for default/warning; cancel for danger (safer default)
    confirmRef.current?.focus();
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Escape to cancel
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onCancel();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel]);

  const confirmBtnClass =
    variant === 'danger'  ? 'btn btn-danger' :
    variant === 'warning' ? 'btn btn-warning' :
    'btn btn-primary';

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onClick={e => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="modal"
      >
        <div className="modal-header">
          <h2 id="modal-title" className="modal-title">{title}</h2>
        </div>

        <p className="modal-message">{message}</p>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button ref={confirmRef} className={confirmBtnClass} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
