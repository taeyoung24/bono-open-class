import React from 'react';
import styles from './TextInput.module.css';

import { IoAlertCircleOutline } from 'react-icons/io5';
import { FaAsterisk } from 'react-icons/fa';

interface TextInputProps {
  label: string;
  type?: 'text' | 'password' | 'email' | 'number';
  value: string;
  placeholder?: string;
  required?: boolean;
  onChange: (value: string) => void;
  name?: string;
  error?: string;
}

export default function TextInput({
  label,
  type = 'text',
  value,
  placeholder,
  required = false,
  onChange,
  name,
  error
}: TextInputProps) {
  return (
    <div className={styles.inputGroup}>
      <label className={styles.label}>
        {label}
        {required && <FaAsterisk className={styles.requiredIcon} size={8} />}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${styles.input} ${error ? styles.inputError : ''}`}
        placeholder={placeholder}
        required={required}
        name={name}
      />
      {error && (
        <span className={styles.errorMessage}>
          <IoAlertCircleOutline size={16} />
          {error}
        </span>
      )}
    </div>
  );
}
