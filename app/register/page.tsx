'use client';

import WideButton from 'app/components/WideButton';
import TextInput from 'app/components/TextInput';
import TextButton from 'app/components/TextButton';
import { useState } from 'react';
import styles from 'app/components/AuthFormLayout.module.css';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [userId, setUserId] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorStatus, setErrorStatus] = useState<{ field: string; message: string } | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId) {
      setErrorStatus({ field: 'userId', message: '아이디를 입력해주세요!' });
      return;
    }
    if (!name) {
      setErrorStatus({ field: 'name', message: '이름을 입력해주세요!' });
      return;
    }
    if (!password) {
      setErrorStatus({ field: 'password', message: '비밀번호를 입력해주세요!' });
      return;
    }
    if (password !== confirmPassword) {
      setErrorStatus({ field: 'confirmPassword', message: '비밀번호가 일치하지 않습니다.' });
      return;
    }

    setErrorStatus(null);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, password, name }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorStatus({ field: 'userId', message: data.message || '가입 중 오류가 발생했습니다.' });
        return;
      }

      alert('회원가입이 완료되었습니다!');
      router.push('/login');
    } catch (error) {
      console.error('Registration error:', error);
      alert('서버와 통신 중 오류가 발생했습니다.');
    }
  };

  return (
    <main className={styles.container}>
      <div className={styles.authCard}>
        <div className={styles.header}>
          <h3 className={styles.title}>회원가입 정보 입력</h3>
        </div>

        <form onSubmit={handleRegister} className={styles.form} noValidate>
          <TextInput
            label="사용할 아이디"
            value={userId}
            onChange={setUserId}
            placeholder="아이디를 입력해주세요"
            required={true}
            error={errorStatus?.field === 'userId' ? errorStatus.message : ''}
          />

          <TextInput
            label="이름"
            value={name}
            onChange={setName}
            placeholder="본명을 입력해주세요"
            required={true}
            error={errorStatus?.field === 'name' ? errorStatus.message : ''}
          />

          <TextInput
            label="비밀번호"
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="비밀번호를 입력해주세요"
            required={true}
            error={errorStatus?.field === 'password' ? errorStatus.message : ''}
          />

          <TextInput
            label="비밀번호 확인"
            type="password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            placeholder="비밀번호를 다시 입력해주세요"
            required={true}
            error={errorStatus?.field === 'confirmPassword' ? errorStatus.message : ''}
          />

          <div style={{ marginTop: '10px' }}>
            <WideButton type="submit" text="가입 완료" />
          </div>
        </form>

        <div className={styles.footer}>
          <TextButton text="이미 계정이 있으신가요? 로그인하러 가기" onClick={() => router.push('/login')} />
        </div>
      </div>

      <div className={styles.bottomFooter}>
        <p>© 2026 Bono Open Class. All rights reserved.</p>
      </div>
    </main>
  );
}
