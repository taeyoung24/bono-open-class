import React from 'react';
import styles from './TextInput.module.css';

import { IoAlertCircleOutline } from 'react-icons/io5';
import { FaAsterisk } from 'react-icons/fa';

interface TextInputProps {
  type?: 'text' | 'password' | 'email' | 'number';
  value: string;
  placeholder?: string;
  required?: boolean;
  onChange: (value: string) => void;
  name?: string;
}

export default function TextInput({
  type = 'text',
  value,
  placeholder,
  required = false,
  onChange,
  name
}: TextInputProps) {
  return (
    <div className={styles.inputGroup}>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={styles.input}
        placeholder={placeholder}
        required={required}
        name={name}
      />
    </div>
  );
}


