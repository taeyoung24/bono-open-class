import React, { useRef, useEffect } from 'react';
import styles from './CodeInput.module.css';

interface CodeInputProps {
  length: number;
  value: string;
  onChange: (value: string) => void;
  pattern?: RegExp;
  disabled?: boolean;
}

export default function CodeInput({
  length,
  value,
  onChange,
  pattern = /^[0-9]$/, // 기본값은 숫자 하나
  disabled = false
}: CodeInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // value가 변경될 때 각 인덱스에 맞는 글자를 채워줌
  const values = value.split('').slice(0, length);
  while (values.length < length) {
    values.push('');
  }

  const handleInputChange = (index: number, char: string) => {
    if (disabled) return;

    // 빈 문자열이거나(지우기) 패턴에 맞는 경우만 수용
    if (char !== '' && !pattern.test(char)) return;

    if (char === '') {
      // 삭제 로직
      const valArr = value.split('');
      valArr[index] = '';
      onChange(valArr.join(''));
    } else {
      // 삽입 및 밀어내기 로직
      const valArr = value.split('');
      // 현재 인덱스에 글자 삽입
      valArr.splice(index, 0, char);
      // 최대 길이만큼 잘라냄
      const joinedValue = valArr.slice(0, length).join('');
      onChange(joinedValue);

      // 다음 필드로 이동
      if (index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    if (e.key === 'Backspace') {
      if (values[index] === '' && index > 0) {
        // 현재 칸이 비어있을 때 백스페이스 누르면 이전 칸으로 이동하며 지움
        inputRefs.current[index - 1]?.focus();
        const newValue = value.split('');
        newValue[index - 1] = '';
        onChange(newValue.join(''));
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').slice(0, length);
    const filteredData = pasteData.split('').filter(char => pattern.test(char)).join('');
    onChange(filteredData);
    
    // 붙여넣기 후 마지막 포커스 이동
    const nextIndex = Math.min(filteredData.length, length - 1);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleFocus = (index: number) => {
    // 사용자가 클릭한 인덱스보다 앞에 빈 칸이 있는지 확인
    const firstEmptyIndex = value.split('').concat(Array(length).fill('')).findIndex(v => v === '' || v === undefined);
    
    // 앞에 빈 칸이 있고 그게 현재 인덱스보다 앞이라면 강제로 거기로 보냄
    if (firstEmptyIndex !== -1 && firstEmptyIndex < index) {
      inputRefs.current[firstEmptyIndex]?.focus();
    }
  };

  return (
    <div className={styles.codeInputContainer}>
      {values.map((val, idx) => (
        <input
          key={idx}
          ref={el => { inputRefs.current[idx] = el; }}
          type="text"
          inputMode="numeric"
          className={styles.codeSlot}
          value={val}
          maxLength={1}
          disabled={disabled}
          onChange={(e) => handleInputChange(idx, e.target.value.slice(-1))}
          onKeyDown={(e) => handleKeyDown(idx, e)}
          onClick={() => handleFocus(idx)}
          onPaste={handlePaste}
          autoComplete="one-time-code"
        />
      ))}
    </div>
  );
}
