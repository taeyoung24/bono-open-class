import React, { useRef } from 'react';
import styles from './FileInput.module.css';
import { FaPaperclip, FaXmark } from 'react-icons/fa6';

interface FileInputProps {
  files: File[];
  onChange: (files: File[]) => void;
  multiple?: boolean;
  accept?: string;
  disabled?: boolean;
}

const AddFileButton = ({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) => (
  <button
    type="button"
    className={styles.addFileButton}
    onClick={onClick}
    disabled={disabled}
  >
    <FaPaperclip className={styles.clipIcon} />
    파일 첨부하기
  </button>
);

export default function FileInput({
  files,
  onChange,
  multiple = true,
  accept,
  disabled = false
}: FileInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      if (multiple) {
        onChange([...files, ...newFiles]);
      } else {
        onChange(newFiles);
      }
    }
    // 같은 파일을 다시 선택할 수 있도록 벨류 초기화
    e.target.value = '';
  };

  const removeFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    onChange(newFiles);
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className={styles.fileInputGroup}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        multiple={multiple}
        accept={accept}
        className={styles.hiddenInput}
        disabled={disabled}
      />
      
      <div className={styles.actionRow}>
        <AddFileButton
          onClick={handleButtonClick}
          disabled={disabled}
        />
      </div>

      <div className={styles.fileList}>
        {files.length > 0 ? (
          files.map((file, index) => (
            <div key={`${file.name}-${index}`} className={styles.fileItem}>
              <span className={styles.fileName}>{file.name}</span>
              <span className={styles.fileSize}>{formatSize(file.size)}</span>
              <button
                type="button"
                className={styles.removeButton}
                onClick={() => removeFile(index)}
                disabled={disabled}
                title="삭제"
              >
                <FaXmark />
              </button>
            </div>
          ))
        ) : (
          <div className={styles.emptyList}>첨부된 파일이 없습니다.</div>
        )}
      </div>
    </div>
  );
}
