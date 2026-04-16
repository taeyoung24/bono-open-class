'use client';

import React from 'react';
import styles from './ConfirmModal.module.css';
import { DefaultButton } from 'app/components/Button';

interface ConfirmModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'primary' | 'danger' | 'correct';
}

export default function ConfirmModal({
  isOpen,
  title = '확인',
  message,
  confirmText = '확인',
  cancelText = '취소',
  onConfirm,
  onCancel,
  variant = 'primary'
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={(e) => e.stopPropagation()}>
      <div className={styles.modal}>
        {title && <h4 className={styles.title}>{title}</h4>}
        <p className={styles.message}>{message}</p>
        <div className={styles.buttonGroup}>
          <DefaultButton
            text={cancelText}
            onClick={onCancel}
            variant="none"
            width="fill"
          />
          <DefaultButton
            text={confirmText}
            onClick={onConfirm}
            variant={variant}
            width="fill"
          />
        </div>
      </div>
    </div>
  );
}
