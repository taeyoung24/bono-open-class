'use client';

import { DefaultButton, FieldButton, TextButton } from 'app/components/Button';
import TextInput from 'app/components/TextInput';
import styles from 'app/components/AuthFormLayout.module.css';
import layoutStyles from 'app/Layout.module.css';
import AlertModal from 'app/modals/AlertModal';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { FaAsterisk } from 'react-icons/fa';
import { IoAlertCircleOutline, IoCheckmarkCircleOutline } from 'react-icons/io5';
import { GLOBAL_CONFIG } from 'src/settings';

export default function RegisterPage() {
  const router = useRouter();
  const [userId, setUserId] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorStatus, setErrorStatus] = useState<{ field: string; message: string; success?: boolean } | null>(null);
  const [isIdChecked, setIsIdChecked] = useState(false);

  const [modal, setModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => { }
  });

  const showModal = (title: string, message: string, onConfirm?: () => void) => {
    setModal({
      isOpen: true,
      title,
      message,
      onConfirm: onConfirm || (() => setModal(prev => ({ ...prev, isOpen: false })))
    });
  };

  const checkIdDuplication = async () => {
    if (!userId) {
      setErrorStatus({ field: 'userId', message: '아이디를 입력해주세요!' });
      return;
    }

    try {
      const response = await fetch('/api/auth/check-id', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await response.json();

      if (data.available) {
        setIsIdChecked(true);
        setErrorStatus({ field: 'userId', message: data.message, success: true });
      } else {
        setIsIdChecked(false);
        setErrorStatus({ field: 'userId', message: data.message });
      }
    } catch (error) {
      showModal('오류', '아이디 중복 확인 중 오류가 발생했습니다.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. 초기화
    setErrorStatus(null);

    // 2. 아이디 유효성 검사
    const userIdRegex = GLOBAL_CONFIG.authRegex.userId;
    if (!userId || !userIdRegex.test(userId)) {
      setErrorStatus({ field: 'userId', message: '아이디는 4자 이상의 영문 또는 숫자여야 합니다.' });
      return;
    }

    // 3. 중복 확인 체크
    if (!isIdChecked) {
      setErrorStatus({ field: 'userId', message: '아이디 중복 확인이 필요합니다.' });
      return;
    }

    // 4. 이름 체크
    if (!name) {
      setErrorStatus({ field: 'name', message: '이름을 입력해주세요!' });
      return;
    }

    // 5. 비밀번호 유효성 검사
    const passwordRegex = GLOBAL_CONFIG.authRegex.password;
    if (!password || !passwordRegex.test(password)) {
      setErrorStatus({ field: 'password', message: '비밀번호는 영문, 숫자, 특수문자를 포함하여 8자 이상이어야 합니다.' });
      return;
    }

    // 6. 비밀번호 일치 확인 (가장 중요한 부분)
    if (password !== confirmPassword) {
      setErrorStatus({ field: 'confirmPassword', message: '비밀번호가 일치하지 않습니다.' });
      return;
    }

    // 7. 서버 전송
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, password, name }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorStatus({
          field: data.field || 'userId',
          message: data.message || '가입 중 오류가 발생했습니다.'
        });
        return;
      }

      showModal('회원가입 완료', '성공적으로 가입되었습니다! 로그인 페이지로 이동합니다.', () => {
        setModal(prev => ({ ...prev, isOpen: false }));
        router.push('/login');
      });
    } catch (error) {
      showModal('오류', '서버와 통신 중 오류가 발생했습니다.');
    }
  };

  return (
    <main className={layoutStyles.container}>
      <div className={layoutStyles.formCard}>
        <div className={layoutStyles.header}>
          <h3 className={layoutStyles.title}>회원가입 정보 입력</h3>
        </div>

        <form onSubmit={handleRegister} className={styles.form} noValidate>
          {/* 아이디 필드 */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>
              사용할 아이디
              <FaAsterisk className={styles.requiredIcon} size={8} />
            </label>
            <div className={styles.inputWithAction}>
              <TextInput
                value={userId}
                onChange={(val) => {
                  setUserId(val);
                  setIsIdChecked(false);
                }}
                placeholder="4자 이상의 영문 또는 숫자"
                required={true}
              />
              <FieldButton
                text="중복 확인"
                type="button"
                onClick={checkIdDuplication}
              />
            </div>
            {errorStatus?.field === 'userId' && (
              <span className={errorStatus.success ? styles.successText : styles.errorText}>
                {errorStatus.success ? <IoCheckmarkCircleOutline size={16} /> : <IoAlertCircleOutline size={16} />}
                {errorStatus.message}
              </span>
            )}
          </div>

          {/* 이름 필드 */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>
              이름
              <FaAsterisk className={styles.requiredIcon} size={8} />
            </label>
            <TextInput
              value={name}
              onChange={setName}
              placeholder="본명을 입력해주세요"
              required={true}
            />
            {errorStatus?.field === 'name' && (
              <span className={styles.errorText}>
                <IoAlertCircleOutline size={16} />
                {errorStatus.message}
              </span>
            )}
          </div>

          {/* 비밀번호 필드 */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>
              비밀번호
              <FaAsterisk className={styles.requiredIcon} size={8} />
            </label>
            <TextInput
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="영문, 숫자, 특수문자 포함 8자 이상"
              required={true}
            />
            {errorStatus?.field === 'password' && (
              <span className={styles.errorText}>
                <IoAlertCircleOutline size={16} />
                {errorStatus.message}
              </span>
            )}
          </div>

          {/* 비밀번호 확인 필드 (정확히 여기 에러가 위치해야 함) */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>
              비밀번호 확인
              <FaAsterisk className={styles.requiredIcon} size={8} />
            </label>
            <TextInput
              type="password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              placeholder="비밀번호를 다시 한번 입력해주세요"
              required={true}
            />
            {errorStatus?.field === 'confirmPassword' && (
              <span className={styles.errorText}>
                <IoAlertCircleOutline size={16} />
                {errorStatus.message}
              </span>
            )}
          </div>

          <div style={{ marginTop: '10px' }}>
            <DefaultButton type="submit" text="가입 완료" />
          </div>
        </form>

        <div className={styles.footer}>
          <TextButton text="이미 계정이 있으신가요? 로그인하러 가기" onClick={() => router.push('/login')} />
        </div>
      </div>

      <div className={layoutStyles.bottomFooter}>
        <p>© 2026 Bono Open Class. All rights reserved.</p>
      </div>

      <AlertModal
        isOpen={modal.isOpen}
        title={modal.title}
        message={modal.message}
        onConfirm={modal.onConfirm}
      />
    </main>
  );
}
