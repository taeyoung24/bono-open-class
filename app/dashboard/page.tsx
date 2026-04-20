'use client';

import layoutStyles from 'app/Layout.module.css';
import ActionList from 'app/components/ActionList';
import { DefaultButton } from 'app/components/Button';
import ConfirmModal from 'app/modals/ConfirmModal';
import { useTransitionNav } from 'app/providers/TransitionProvider';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { logger } from 'src/utils/log';
import { UserRole } from 'src/types';
import styles from './dashboard.module.css';

import { FaEnvelope, FaUserTag } from 'react-icons/fa6';

export default function DashboardPage() {
  const router = useRouter();
  const { transitionTo } = useTransitionNav();
  const [userName, setUserName] = useState('사용자');
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState<UserRole | ''>('');
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = () => {
    setIsLoggingOut(true);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_info');
    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';

    // 로그아웃 시에도 매끄러운 전환을 위해 transitionTo 사용
    transitionTo('/login');
  };

  useEffect(() => {
    // 로컬 스토리지에서 사용자 정보 가져오기
    const storedUser = localStorage.getItem('user_info');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setUserName(user.name || user.userId || '사용자');
        setUserEmail(user.email || '');
        setUserRole(user.role || '');
      } catch (e) {
        logger.e(`Failed to parse user info: ${e}`);
      }
    }
  }, []);

  const menuItems = [
    { label: '메일함', onClick: () => transitionTo('/dashboard/mailbox') },
    { label: '타자연습 기록실', onClick: () => transitionTo('/dashboard/typing-records') },
    { label: '본오스퀘어', onClick: () => transitionTo('/dashboard/sns') },
    { label: '내 정보 수정', onClick: () => transitionTo('/dashboard/profile') },
  ];

  const ROLE_NAME_MAP: Record<string, string> = {
    'ADMIN': '관리자',
    'STUDENT': '학생',
    'TEACHER': '선생님'
  };

  return (
    <main className={layoutStyles.container}>
      <div className={layoutStyles.formCard}>
        <div className={layoutStyles.header}>
          <h3 className={layoutStyles.title}>대쉬보드 메뉴 ({userName})</h3>
          <div className={styles.userInfo}>
            <div className={styles.infoItem}>
              <span className={styles.infoIcon}><FaEnvelope /></span>
              <span>{userEmail}</span>
            </div>
            {userRole && (
              <div className={styles.infoItem}>
                <span className={styles.infoIcon}><FaUserTag /></span>
                <span>{ROLE_NAME_MAP[userRole] || userRole}</span>
              </div>
            )}
          </div>
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
        isLoading={isLoggingOut}
      />
    </main>
  );
}
