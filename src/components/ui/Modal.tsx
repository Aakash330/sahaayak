import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [isOpen]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <dialog
      ref={dialogRef}
      onCancel={onClose}
      onClick={handleBackdropClick}
      className="backdrop:bg-stone-900/50 rounded-2xl shadow-xl border border-stone-200 p-0 max-w-2xl w-full mx-auto mt-20"
      aria-labelledby="modal-title"
    >
      <div className="bg-white">
        <div className="flex items-center justify-between p-6 border-b border-stone-200">
          <h2 id="modal-title" className="text-2xl font-bold text-stone-900">
            {title}
          </h2>
          <Button variant="secondary" onClick={onClose} icon={X} aria-label={`Close ${title}`}>
            Close
          </Button>
        </div>
        <div className="p-6 sm:p-8">
          {children}
        </div>
      </div>
    </dialog>
  );
};
