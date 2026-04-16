import React, { useState } from 'react';
import styles from './TextInput.module.css';

import { IoEyeOffOutline, IoEyeOutline } from 'react-icons/io5';

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
  const [showPassword, setShowPassword] = useState(false);

  // 비밀번호 표시 여부에 따라 타입 전환 (password -> text)
  const inputType = type === 'password' && showPassword ? 'text' : type;

  return (
    <div className={styles.inputGroup}>
      <div className={styles.inputWrapper}>
        <input
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={styles.input}
          placeholder={placeholder}
          required={required}
          name={name}
          style={type === 'password' ? { paddingRight: '40px' } : {}}
        />
        {type === 'password' && (
          <button
            type="button"
            className={styles.eyeButton}
            onMouseDown={() => setShowPassword(true)}
            onMouseUp={() => setShowPassword(false)}
            onMouseLeave={() => setShowPassword(false)}
            onTouchStart={() => setShowPassword(true)}
            onTouchEnd={() => setShowPassword(false)}
            tabIndex={-1}
          >
            {showPassword ? <IoEyeOutline size={20} /> : <IoEyeOffOutline size={20} />}
          </button>
        )}
      </div>
    </div>
  );
}


