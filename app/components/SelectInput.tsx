import React from 'react';
import styles from './SelectInput.module.css';
import { IoChevronDownOutline } from 'react-icons/io5';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectInputProps {
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
  name?: string;
  required?: boolean;
}

export default function SelectInput({
  value,
  options,
  onChange,
  disabled = false,
  name,
  required = false
}: SelectInputProps) {
  return (
    <div className={styles.inputGroup}>
      <div className={styles.inputWrapper}>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={styles.select}
          disabled={disabled}
          name={name}
          required={required}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className={styles.icon}>
          <IoChevronDownOutline size={16} />
        </div>
      </div>
    </div>
  );
}
