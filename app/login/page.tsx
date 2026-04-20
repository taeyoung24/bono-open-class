'use client';

import styles from 'app/components/AuthFormLayout.module.css';
import { DefaultButton, TextButton } from 'app/components/Button';
import TextInput from 'app/components/TextInput';
import layoutStyles from 'app/Layout.module.css';
import AlertModal from 'app/modals/AlertModal';
import { useTransitionNav } from 'app/providers/TransitionProvider';

import { useState } from 'react';
import { FaAsterisk } from 'react-icons/fa';
import { IoAlertCircleOutline } from 'react-icons/io5';
import { logger } from 'src/utils/log';

export default function LoginPage() {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorStatus, setErrorStatus] = useState<{ field: string; message: string } | null>(null);

  // 모달 상태
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
    setIsLoading(true);

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
        setIsLoading(false);
        return;
      }

      // JWT 토큰 저장
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('user_info', JSON.stringify(data.user));

      transitionTo('/dashboard');

    } catch (error) {
      logger.e(`Login error: ${error}`);
      showModal('오류', '서버와 통신 중 오류가 발생했습니다.');
      setIsLoading(false);
    }
  };

  const { transitionTo } = useTransitionNav();


  return (
    <main className={layoutStyles.container}>
      <div className={layoutStyles.formCard}>

        <div className={layoutStyles.header}>
          <h3 className={layoutStyles.title}>로그인으로 시작</h3>
          <p className={layoutStyles.subtitle}>이 앱은 교육용으로 제작되었습니다.<br></br>자세한 사항은 하단 앱 정보를 확인해주세요.</p>
        </div>

        <form onSubmit={handleLogin} className={layoutStyles.form} noValidate>
          <div className={layoutStyles.fieldGroup}>
            <label className={layoutStyles.label}>
              아이디
              <FaAsterisk className={layoutStyles.requiredIcon} size={8} />
            </label>
            <TextInput
              value={userId}
              onChange={setUserId}
              placeholder="아이디를 입력해주세요"
              required={true}
            />
            {errorStatus?.field === 'userId' && (
              <span className={layoutStyles.errorText}>
                <IoAlertCircleOutline />
                {errorStatus.message}
              </span>
            )}
          </div>

          <div className={layoutStyles.fieldGroup}>
            <label className={layoutStyles.label}>
              비밀번호
              <FaAsterisk className={layoutStyles.requiredIcon} size={8} />
            </label>
            <TextInput
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="비밀번호를 입력해주세요"
              required={true}
            />
            {errorStatus?.field === 'password' && (
              <span className={layoutStyles.errorText}>
                <IoAlertCircleOutline />
                {errorStatus.message}
              </span>
            )}
          </div>

          <DefaultButton type="submit" text="로그인" isLoading={isLoading} />
        </form>

        <div className={styles.helperActions}>
          <TextButton text="비밀번호 찾기" onClick={() => transitionTo('/reset-password')} />
          <div className={styles.divider} />
          <TextButton text="새로 가입하기" onClick={() => transitionTo('/register')} />
          <div className={styles.divider} />
          <TextButton text="앱 정보" onClick={() => transitionTo('/about')} />

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



