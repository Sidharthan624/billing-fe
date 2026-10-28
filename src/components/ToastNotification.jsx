import React from 'react';

export default function ToastNotification({ toast, onClose }) {
  if (!toast) return null;

  const typeClass =
    toast.type === 'success'
      ? 'toast-success'
      : toast.type === 'error'
      ? 'toast-error'
      : 'toast-info';

  return (
    <div className="toast-container">
      <div className={`toast ${typeClass}`}>
        <span>{toast.message}</span>
        <button
          onClick={onClose}
          style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', marginLeft: 8 }}
        >
          ✕
        </button>
      </div>
    </div>
  );
}
