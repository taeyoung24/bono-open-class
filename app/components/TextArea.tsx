import React from 'react';
import styles from './TextArea.module.css';

interface TextAreaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  required?: boolean;
  disabled?: boolean;
  maxLength?: number;
}

export default function TextArea({
  value,
  onChange,
  placeholder,
  rows = 5,
  required = false,
  disabled = false,
  maxLength
}: TextAreaProps) {
  return (
    <div className={styles.container}>
      <textarea
        className={styles.textarea}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        required={required}
        disabled={disabled}
        maxLength={maxLength}
      />
    </div>
  );
}
