import React from 'react';
import { X } from 'lucide-react';
import './Modal.css';

const Modal = ({ isOpen, onClose, title, children, maxWidth = '560px', className }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className={`modal-container ${className || ''}`} style={{ maxWidth }}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button onClick={onClose} className="close-btn">
            <X size={20} />
          </button>
        </div>
        <div className="modal-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
