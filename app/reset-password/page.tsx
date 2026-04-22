'use client';

import styles from 'app/components/AuthFormLayout.module.css';
import { DefaultButton, TextButton } from 'app/components/Button';
import CodeInput from 'app/components/CodeInput';
import TextInput from 'app/components/TextInput';
import layoutStyles from 'app/Layout.module.css';
import AlertModal from 'app/modals/AlertModal';
import { useTransitionNav } from 'app/providers/TransitionProvider';

import { useState } from 'react';
import { FaAsterisk } from 'react-icons/fa';
import { IoAlertCircleOutline } from 'react-icons/io5';
import { GLOBAL_CONFIG } from 'src/settings';

type Step = 'request' | 'verify' | 'reset';

export default function ResetPasswordPage() {
  const { transitionTo } = useTransitionNav();


  const [step, setStep] = useState<Step>('request');
  const [userId, setUserId] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorStatus, setErrorStatus] = useState<{ field: string; message: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [modal, setModal] = useState({ isOpen: false, title: '', message: '', onConfirm: () => { } });

  const showModal = (title: string, message: string, onConfirm?: () => void) => {
    setModal({
      isOpen: true, title, message,
      onConfirm: onConfirm || (() => setModal(prev => ({ ...prev, isOpen: false })))
    });
  };

  // STEP 1: 아이디 입력 → 선생님에게 코드 전송
  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorStatus(null);

    if (!userId) {
      setErrorStatus({ field: 'userId', message: '아이디를 입력해주세요.' });
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorStatus({ field: 'userId', message: data.message });
        return;
      }

      setStep('verify');
    } catch {
      showModal('오류', '서버와 통신 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // STEP 2: 인증코드 입력 → 검증
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorStatus(null);

    if (!code || code.length !== 4) {
      setErrorStatus({ field: 'code', message: '4자리 인증코드를 입력해주세요.' });
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, code }),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorStatus({ field: 'code', message: data.message });
        return;
      }

      setStep('reset');
    } catch {
      showModal('오류', '서버와 통신 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // STEP 3: 새 비밀번호 설정
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorStatus(null);

    const passwordRegex = GLOBAL_CONFIG.authRegex.password;
    if (!newPassword || !passwordRegex.test(newPassword)) {
      setErrorStatus({ field: 'newPassword', message: '영문, 숫자, 특수문자를 포함하여 8자 이상이어야 합니다.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorStatus({ field: 'confirmPassword', message: '비밀번호가 일치하지 않습니다.' });
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, code, newPassword }),
      });
      const data = await res.json();

      if (!res.ok) {
        showModal('오류', data.message);
        return;
      }

      showModal('완료', '비밀번호가 성공적으로 변경되었습니다.', () => {
        setModal(prev => ({ ...prev, isOpen: false }));
        transitionTo('/login');

      });
    } catch {
      showModal('오류', '서버와 통신 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const stepTitles: Record<Step, string> = {
    request: '비밀번호 재설정',
    verify: '인증코드 입력',
    reset: '새 비밀번호 설정',
  };

  const stepDescriptions: Record<Step, string> = {
    request: '아이디를 입력하면 선생님에게 인증코드가 전달됩니다.',
    verify: `선생님에게 받은 4자리 인증코드를 입력해주세요.\n코드는 10분간 유효합니다.`,
    reset: '새로 사용할 비밀번호를 입력해주세요.',
  };

  return (
    <main className={layoutStyles.container}>
      <div className={layoutStyles.formCard}>
        <div className={layoutStyles.header}>
          <h3 className={layoutStyles.title}>{stepTitles[step]}</h3>
          <p className={layoutStyles.subtitle}>{stepDescriptions[step]}</p>
        </div>

        {/* STEP 1: 아이디 입력 */}
        {step === 'request' && (
          <form onSubmit={handleRequestCode} className={layoutStyles.form} noValidate>
            <div className={layoutStyles.fieldGroup}>
              <label className={layoutStyles.label}>
                아이디
                <FaAsterisk className={layoutStyles.requiredIcon} size={8} />
              </label>
              <TextInput
                value={userId}
                onChange={setUserId}
                placeholder="로그인에 사용하는 아이디"
                required={true}
              />
              {errorStatus?.field === 'userId' && (
                <span className={layoutStyles.errorText}>
                  <IoAlertCircleOutline />
                  {errorStatus.message}
                </span>
              )}
            </div>
            <DefaultButton type="submit" text="인증코드 요청" isLoading={isLoading} />
          </form>
        )}

        {/* STEP 2: 인증코드 입력 */}
        {step === 'verify' && (
          <form onSubmit={handleVerifyCode} className={layoutStyles.form} noValidate>
            <div className={layoutStyles.fieldGroup}>
              <label className={layoutStyles.label}>
                인증코드
                <FaAsterisk className={layoutStyles.requiredIcon} size={8} />
              </label>
              <CodeInput
                length={4}
                value={code}
                onChange={setCode}
                disabled={isLoading}
              />
              {errorStatus?.field === 'code' && (
                <span className={layoutStyles.errorText}>
                  <IoAlertCircleOutline />
                  {errorStatus.message}
                </span>
              )}
            </div>
            <DefaultButton type="submit" text={isLoading ? '확인 중...' : '코드 확인'} disabled={isLoading} />
          </form>
        )}

        {/* STEP 3: 새 비밀번호 */}
        {step === 'reset' && (
          <form onSubmit={handleResetPassword} className={layoutStyles.form} noValidate>
            <div className={layoutStyles.fieldGroup}>
              <label className={layoutStyles.label}>
                새 비밀번호
                <FaAsterisk className={layoutStyles.requiredIcon} size={8} />
              </label>
              <TextInput
                type="password"
                value={newPassword}
                onChange={setNewPassword}
                placeholder="영문, 숫자, 특수문자 포함 8자 이상"
                required={true}
              />
              {errorStatus?.field === 'newPassword' && (
                <span className={layoutStyles.errorText}>
                  <IoAlertCircleOutline />
                  {errorStatus.message}
                </span>
              )}
            </div>
            <div className={layoutStyles.fieldGroup}>
              <label className={layoutStyles.label}>
                비밀번호 확인
                <FaAsterisk className={layoutStyles.requiredIcon} size={8} />
              </label>
              <TextInput
                type="password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                placeholder="비밀번호를 다시 입력해주세요"
                required={true}
              />
              {errorStatus?.field === 'confirmPassword' && (
                <span className={layoutStyles.errorText}>
                  <IoAlertCircleOutline />
                  {errorStatus.message}
                </span>
              )}
            </div>
            <DefaultButton type="submit" text={isLoading ? '변경 중...' : '비밀번호 변경'} disabled={isLoading} />
          </form>
        )}

        <div className={styles.footer}>
          <TextButton text="로그인으로 돌아가기" onClick={() => transitionTo('/login')} />

        </div>
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
