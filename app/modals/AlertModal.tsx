'use client';

import React from 'react';
import styles from './AlertModal.module.css';
import { DefaultButton } from 'app/components/Button';

interface AlertModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  onConfirm: () => void;
}

export default function AlertModal({ 
  isOpen, 
  title = '알림', 
  message, 
  onConfirm 
}: AlertModalProps) {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={(e) => e.stopPropagation()}>
      <div className={styles.modal}>
        {title && <h4 className={styles.title}>{title}</h4>}
        <p className={styles.message}>{message}</p>
        <DefaultButton 
          text="확인" 
          onClick={onConfirm} 
          width="fill" 
        />
      </div>
    </div>
  );
}
