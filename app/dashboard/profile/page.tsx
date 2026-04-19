'use client';

import layoutStyles from 'app/Layout.module.css';
import { DefaultButton } from 'app/components/Button';
import TextInput from 'app/components/TextInput';
import AlertModal from 'app/modals/AlertModal';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { logger } from 'src/utils/log';

export default function ProfilePage() {
  const router = useRouter();
  const [userId, setUserId] = useState('');
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [bio, setBio] = useState('');
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
        setNickname(user.nickname || '');
        setProfileImage(user.profileImage || '');
        setBio(user.bio || '');
      } catch (e) {
        logger.e(`Failed to parse user info: ${e}`);
      }
    } else {
      router.push('/login');
    }
  }, [router]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ nickname, profileImage, bio }),
      });

      const data = await response.json();

      if (!response.ok) {
        showModal('오류', data.message || '정보 수정 중 오류가 발생했습니다.');
        return;
      }

      // 로컬 스토리지 정보 갱신
      const storedUser = JSON.parse(localStorage.getItem('user_info') || '{}');
      const updatedUser = { ...storedUser, nickname, profileImage, bio };
      localStorage.setItem('user_info', JSON.stringify(updatedUser));

      showModal('수정 완료', '프로필 정보가 성공적으로 수정되었습니다.', () => {
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
          <h3 className={layoutStyles.title}>내 프로필 수정</h3>
          <p className={layoutStyles.subtitle}>SNS 공간에서 보여질 정보를 설정하세요.</p>
        </div>

        <form onSubmit={handleUpdate} className={layoutStyles.form} noValidate>
          <div className={layoutStyles.fieldGroup}>
            <label className={layoutStyles.label}>아이디</label>
            <TextInput
              value={userId}
              onChange={() => { }}
              disabled={true}
            />
          </div>

          <div className={layoutStyles.fieldGroup}>
            <label className={layoutStyles.label}>이름 (실명)</label>
            <TextInput
              value={name}
              onChange={() => { }}
              disabled={true}
            />
          </div>

          <div className={layoutStyles.fieldGroup}>
            <label className={layoutStyles.label}>닉네임 (SNS 활동명)</label>
            <TextInput
              value={nickname}
              onChange={setNickname}
              placeholder="멋진 닉네임을 입력하세요"
              maxLength={20}
            />
          </div>

          <div className={layoutStyles.fieldGroup}>
            <label className={layoutStyles.label}>프로필 이미지 URL</label>
            <TextInput
              value={profileImage}
              onChange={setProfileImage}
              placeholder="이미지 주소를 입력하세요"
            />
          </div>

          <div className={layoutStyles.fieldGroup}>
            <label className={layoutStyles.label}>상태 메시지 (한 줄 소개)</label>
            <TextInput
              value={bio}
              onChange={setBio}
              placeholder="자신을 한 줄로 소개해보세요"
              maxLength={50}
            />
          </div>

          <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <DefaultButton
              type="submit"
              text={isLoading ? '저장 중...' : '프로필 저장하기'}
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
