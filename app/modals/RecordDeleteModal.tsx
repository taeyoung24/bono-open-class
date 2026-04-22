'use client';

import { DefaultButton, FieldButton } from 'app/components/Button';
import CodeInput from 'app/components/CodeInput';
import layoutStyles from 'app/Layout.module.css';
import { useEffect, useState } from 'react';
import styles from './ConfirmModal.module.css';

interface RecordDeleteModalProps {
  isOpen: boolean;
  onConfirm: (code: string) => void;
  onCancel: () => void;
  onRequestCode: () => void;
  isLoading?: boolean;
  isRequestingCode?: boolean;
}

export default function RecordDeleteModal({
  isOpen,
  onConfirm,
  onCancel,
  onRequestCode,
  isLoading = false,
  isRequestingCode = false
}: RecordDeleteModalProps) {
  const [code, setCode] = useState('');
  const [hasRequested, setHasRequested] = useState(false);

  // 모달이 열릴 때마다 입력값 초기화
  useEffect(() => {
    if (isOpen) {
      setCode('');
      setHasRequested(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={(e) => e.stopPropagation()}>
      <div className={styles.modal}>
        <h4 className={styles.title}>기록 삭제 승인</h4>
        <p className={styles.message}>선생님께 받은 삭제 코드를 입력해주세요.</p>

        <div className={styles.inputSection}>
          <div className={layoutStyles.inputWithAction}>
            <CodeInput
              length={4}
              value={code}
              onChange={setCode}
              disabled={isLoading}
            />
            <FieldButton
              text={hasRequested ? "다시 요청" : "코드 요청"}
              onClick={() => {
                onRequestCode();
                setHasRequested(true);
              }}
              isLoading={isRequestingCode}
              variant={hasRequested ? "none" : "default"}
              disabled={isLoading}
            />
          </div>
        </div>

        <div className={styles.buttonGroup}>
          <DefaultButton
            text="취소"
            onClick={onCancel}
            variant="none"
            width="fill"
            disabled={isLoading}
          />
          <DefaultButton
            text="삭제"
            onClick={() => onConfirm(code)}
            variant="danger"
            width="fill"
            isLoading={isLoading}
            disabled={code.length !== 4}
          />
        </div>
      </div>
    </div>
  );
}
