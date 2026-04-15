import React from 'react';
import styles from './TextButton.module.css';

interface TextButtonProps {
  text: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

export default function TextButton({ 
  text, 
  onClick, 
  type = 'button', 
  disabled = false 
}: TextButtonProps) {
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
