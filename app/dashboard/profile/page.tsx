'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import layoutStyles from 'app/Layout.module.css';
import styles from 'app/components/AuthFormLayout.module.css';
import { DefaultButton, TextButton } from 'app/components/Button';
import TextInput from 'app/components/TextInput';
import AlertModal from 'app/modals/AlertModal';

export default function ProfilePage() {
  const router = useRouter();
  const [userId, setUserId] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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

  useEffect(() => {
    const storedUser = localStorage.getItem('user_info');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setUserId(user.userId || '');
        setName(user.name || '');
      } catch (e) {
        console.error('Failed to parse user info');
      }
    } else {
      router.push('/login');
    }
  }, [router]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showModal('입력 오류', '이름을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, name }),
      });

      const data = await response.json();

      if (!response.ok) {
        showModal('오류', data.message || '정보 수정 중 오류가 발생했습니다.');
        return;
      }

      // 로컬 스토리지 정보 갱신
      const storedUser = JSON.parse(localStorage.getItem('user_info') || '{}');
      localStorage.setItem('user_info', JSON.stringify({ ...storedUser, name }));

      showModal('수정 완료', '회원 정보가 성공적으로 수정되었습니다.', () => {
        setModal(prev => ({ ...prev, isOpen: false }));
        router.push('/dashboard');
      });
    } catch (error) {
      showModal('오류', '서버와 통신 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className={layoutStyles.container}>
      <div className={layoutStyles.formCard}>
        <div className={layoutStyles.header}>
          <h3 className={layoutStyles.title}>내 정보 수정</h3>
          <p className={layoutStyles.subtitle}>프로필 정보를 변경할 수 있습니다.</p>
        </div>

        <form onSubmit={handleUpdate} className={layoutStyles.form} noValidate>
          <div className={layoutStyles.fieldGroup}>
            <label className={layoutStyles.label}>아이디 (수정 불가)</label>
            <TextInput
              value={userId}
              onChange={() => {}}
              placeholder="아이디"
              disabled={true}
            />
          </div>

          <div className={layoutStyles.fieldGroup}>
            <label className={layoutStyles.label}>이름</label>
            <TextInput
              value={name}
              onChange={setName}
              placeholder="변경할 이름을 입력하세요"
              required
            />
          </div>

          <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <DefaultButton 
              type="submit" 
              text={isLoading ? '저장 중...' : '정보 저장하기'} 
              disabled={isLoading} 
              variant="correct"
            />
            <DefaultButton 
              text="취소하고 돌아가기" 
              onClick={() => router.back()} 
              variant="none"
            />
          </div>
        </form>
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
