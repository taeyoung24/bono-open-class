'use client';

import React from 'react';
import styles from './WideButton.module.css';

interface WideButtonProps {
  text: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

export default function WideButton({ 
  text, 
  onClick, 
  type = 'button', 
  disabled = false 
}: WideButtonProps) {
  return (
    <button
      type={type}
      className={styles.button}
      onClick={onClick}
      disabled={disabled}
    >
      {text}
    </button>
  );
}
