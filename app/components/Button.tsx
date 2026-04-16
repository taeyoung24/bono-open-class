import React from 'react';
import styles from './Button.module.css';

interface ButtonProps {
  text: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

interface DefaultButtonProps extends ButtonProps {
  width?: 'fill' | 'hug' | string;
  variant?: 'primary' | 'danger' | 'none' | 'correct';
}

export function DefaultButton({
  text,
  onClick,
  type = 'button',
  disabled = false,
  width = 'fill',
  variant = 'primary'
}: DefaultButtonProps) {
  // width 값에 따른 실제 스타일 결정
  const getWidthStyle = () => {
    switch (width) {
      case 'fill': return '100%';
      case 'hug': return 'fit-content';
      default: return width;
    }
  };

  return (
    <button
      type={type}
      className={`${styles.button} ${styles.wide} ${styles[variant]}`}
      onClick={onClick}
      disabled={disabled}
      style={{ width: getWidthStyle() }}
    >
      {text}
    </button>
  );
}

export function TextButton({
  text,
  onClick,
  type = 'button',
  disabled = false
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`${styles.button} ${styles.text}`}
      onClick={onClick}
      disabled={disabled}
    >
      {text}
    </button>
  );
}

export function FieldButton({
  text,
  onClick,
  type = 'button',
  disabled = false,
  width = 'hug'
}: DefaultButtonProps) {
  const getWidthStyle = () => {
    switch (width) {
      case 'fill': return '100%';
      case 'hug': return 'fit-content';
      default: return width;
    }
  };

  return (
    <button
      type={type}
      className={`${styles.button} ${styles.field}`}
      onClick={onClick}
      disabled={disabled}
      style={{ width: getWidthStyle() }}
    >
      {text}
    </button>
  );
}

