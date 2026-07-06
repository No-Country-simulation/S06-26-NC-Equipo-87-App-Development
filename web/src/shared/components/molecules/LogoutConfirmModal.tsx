import React, { useEffect } from 'react';

interface LogoutConfirmModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export const LogoutConfirmModal: React.FC<LogoutConfirmModalProps> = ({
  onConfirm,
  onCancel,
}) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onCancel]);

  return (
    <div
      className="opscore-modal-overlay"
      onClick={onCancel}
      role="presentation"
    >
      <div
        className="opscore-modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="logout-modal-title"
      >
        <h2 className="opscore-modal-title" id="logout-modal-title">
          Cerrar Sesión
        </h2>
        <p className="opscore-modal-message">
          Estás a punto de salir de tu cuenta. ¿Deseas continuar?
        </p>
        <div className="opscore-modal-actions">
          <button
            onClick={onCancel}
            className="opscore-modal-btn opscore-modal-btn-cancel"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="opscore-modal-btn opscore-modal-btn-confirm"
          >
            Sí, salir
          </button>
        </div>
      </div>
    </div>
  );
};
