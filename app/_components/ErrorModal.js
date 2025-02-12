import React from 'react';
import { createPortal } from 'react-dom';

const ErrorModal = ({ children, onClose }) => {
  return createPortal(
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center"
      onClick={onClose}
    >
      {children}
    </div>,
    document.body
  );
};

export default ErrorModal;
