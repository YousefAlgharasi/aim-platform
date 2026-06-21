import { ReactNode, useEffect, useRef } from 'react';
import styles from './Modal.module.css';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const handleClose = () => onClose();
    dialog.addEventListener('close', handleClose);
    return () => dialog.removeEventListener('close', handleClose);
  }, [onClose]);

  return (
    <dialog ref={dialogRef} className={styles.modal} aria-labelledby="modal-title">
      <header className={styles.header}>
        <h2 id="modal-title" className={styles.title}>{title}</h2>
        <button className={styles.close} onClick={onClose} aria-label="Close">
          ✕
        </button>
      </header>
      <div className={styles.body}>{children}</div>
    </dialog>
  );
}
