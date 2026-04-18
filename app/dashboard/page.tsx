'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './dashboard.module.css';
import layoutStyles from 'app/Layout.module.css';
import { DefaultButton } from 'app/components/Button';
import ActionList from 'app/components/ActionList';
import ConfirmModal from 'app/modals/ConfirmModal';

export default function DashboardPage() {
  const router = useRouter();
  const [userName, setUserName] = useState('사용자');
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_info');
    router.push('/login');
  };

  useEffect(() => {
    // 로컬 스토리지에서 사용자 정보 가져오기
    const storedUser = localStorage.getItem('user_info');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setUserName(user.name || user.userId || '사용자');
      } catch (e) {
        console.error('Failed to parse user info');
      }
    }
  }, []);

  const menuItems = [
    { label: '메일함', onClick: () => router.push('/dashboard/mailbox') },
    { label: '타자연습 기록실', onClick: () => router.push('/dashboard/typing-records') },
    { label: '내 정보 수정', onClick: () => router.push('/dashboard/profile') },
  ];

  return (
    <main className={layoutStyles.container}>
      <div className={layoutStyles.formCard}>
        <div className={layoutStyles.header}>
          <h3 className={layoutStyles.title}>대쉬보드 메뉴 ({userName})</h3>
        </div>

        <ActionList items={menuItems} />

        <div className={styles.logoutSection}>
          <DefaultButton
            text="로그아웃"
            onClick={() => setIsLogoutModalOpen(true)}
            width='fill'
            variant="none"
          />
        </div>
      </div>

      <ConfirmModal
        isOpen={isLogoutModalOpen}
        title="로그아웃"
        message="정말로 로그아웃 하시겠습니까?"
        confirmText="로그아웃"
        cancelText="취소"
        onConfirm={handleLogout}
        onCancel={() => setIsLogoutModalOpen(false)}
        variant="danger"
      />
    </main>
  );
}
