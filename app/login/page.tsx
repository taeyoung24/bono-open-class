'use client';

import styles from 'app/components/AuthFormLayout.module.css';
import { DefaultButton, TextButton } from 'app/components/Button';
import TextInput from 'app/components/TextInput';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { FaAsterisk } from 'react-icons/fa';
import { IoAlertCircleOutline } from 'react-icons/io5';
import AlertModal from 'app/modals/AlertModal';

export default function LoginPage() {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [errorStatus, setErrorStatus] = useState<{ field: string; message: string } | null>(null);
  
  // 모달 상태
  const [modal, setModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const showModal = (title: string, message: string, onConfirm?: () => void) => {
    setModal({
      isOpen: true,
      title,
      message,
      onConfirm: onConfirm || (() => setModal(prev => ({ ...prev, isOpen: false })))
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // 브라우저 기본 validation 대신 커스텀 체크
    if (!userId) {
      setErrorStatus({ field: 'userId', message: '아이디를 입력해주세요!' });
      return;
    }
    if (!password) {
      setErrorStatus({ field: 'password', message: '비밀번호를 입력해주세요!' });
      return;
    }

    setErrorStatus(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // 비밀번호 관련 에러인 경우 password 필드 아래에 표시
        const isPasswordError = data.message?.includes('비밀번호');
        setErrorStatus({ 
          field: isPasswordError ? 'password' : 'userId', 
          message: data.message || '로그인 중 오류가 발생했습니다.' 
        });
        return;
      }

      // JWT 토큰 저장
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('user_info', JSON.stringify(data.user));

      showModal('로그인 성공', '환영합니다! 메인 페이지로 이동합니다.', () => {
        setModal(prev => ({ ...prev, isOpen: false }));
        router.push('/');
      });
    } catch (error) {
      console.error('Login error:', error);
      showModal('오류', '서버와 통신 중 오류가 발생했습니다.');
    }
  };

  const router = useRouter();

  return (
    <main className={styles.container}>
      <div className={styles.authCard}>

        <div className={styles.header}>
          <h3 className={styles.title}>로그인으로 시작</h3>
        </div>

        <form onSubmit={handleLogin} className={styles.form} noValidate>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>
              아이디
              <FaAsterisk className={styles.requiredIcon} size={8} />
            </label>
            <TextInput
              value={userId}
              onChange={setUserId}
              placeholder="아이디를 입력해주세요"
              required={true}
            />
            {errorStatus?.field === 'userId' && (
              <span className={styles.errorText}>
                <IoAlertCircleOutline size={16} />
                {errorStatus.message}
              </span>
            )}
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>
              비밀번호
              <FaAsterisk className={styles.requiredIcon} size={8} />
            </label>
            <TextInput
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="비밀번호를 입력해주세요"
              required={true}
            />
            {errorStatus?.field === 'password' && (
              <span className={styles.errorText}>
                <IoAlertCircleOutline size={16} />
                {errorStatus.message}
              </span>
            )}
          </div>

          <DefaultButton type="submit" text="로그인" />
        </form>

        <div className={styles.helperActions}>
          <TextButton text="비밀번호 찾기" onClick={() => router.push('/reset-password')} />
          <div className={styles.divider} />
          <TextButton text="새로 가입하기" onClick={() => router.push('/register')} />
        </div>
      </div>

      <div className={styles.bottomFooter}>
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



