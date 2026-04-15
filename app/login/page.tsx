'use client';

import WideButton from 'app/components/WideButton';
import TextInput from 'app/components/TextInput';
import TextButton from 'app/components/TextButton';
import { useState } from 'react';
import styles from './Login.module.css';

export default function LoginPage() {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [errorStatus, setErrorStatus] = useState<{ field: string; message: string } | null>(null);

  const handleLogin = (e: React.FormEvent) => {
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
    console.log('Login attempt:', { userId, password });
  };

  return (
    <main className={styles.container}>
      <div className={styles.loginCard}>
        <div className={styles.header}>
          <h1 className={styles.title}>로그인</h1>
          <p className={styles.subtitle}>본오동 열린 교실 컴퓨터 교육용 앱</p>
        </div>

        <form onSubmit={handleLogin} className={styles.form} noValidate>
          <TextInput
            label="아이디"
            value={userId}
            onChange={setUserId}
            placeholder="아이디를 입력해주세요"
            error={errorStatus?.field === '아이디' ? errorStatus.message : ''}
          />

          <TextInput
            label="비밀번호"
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="비밀번호를 입력해주세요"
            error={errorStatus?.field === '비밀번호' ? errorStatus.message : ''}
          />

          <WideButton type="submit" text="로그인" />
        </form>

        <div className={styles.helperActions}>
          <TextButton text="비밀번호 찾기" onClick={() => console.log('Find Password')} />
          <div className={styles.divider} />
          <TextButton text="새로 가입하기" onClick={() => console.log('Sign Up')} />
        </div>
      </div>

      <div className={styles.footer}>
        <p>© 2026 Bono Open Class. All rights reserved.</p>
      </div>
    </main>
  );
}
