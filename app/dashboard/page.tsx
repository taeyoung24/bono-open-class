'use client';

import layoutStyles from 'app/Layout.module.css';
import ActionList from 'app/components/ActionList';
import { DefaultButton } from 'app/components/Button';
import ConfirmModal from 'app/modals/ConfirmModal';
import Tooltip from 'app/overlays/Tooltip';
import { useTransitionNav } from 'app/providers/TransitionProvider';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { UserRole } from 'src/types';
import { logger } from 'src/utils/log';
import styles from './dashboard.module.css';

import { FaEnvelope, FaStamp, FaUserTag } from 'react-icons/fa6';

export default function DashboardPage() {
  const router = useRouter();
  const { transitionTo } = useTransitionNav();
  const [userName, setUserName] = useState('사용자');
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState<UserRole | ''>('');
  const [stickerCount, setStickerCount] = useState(0); // 추후 API 연동 필요
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

  const fetchStickerCount = async (uid: string) => {
    try {
      const response = await fetch(`/api/user/sticker-placements?userId=${uid}`);
      if (response.ok) {
        const data = await response.json();
        setStickerCount(data.placements.length);
      }
    } catch (e) {
      logger.e(`Failed to fetch sticker count: ${e}`);
    }
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

        if (user.userId) {
          fetchStickerCount(user.userId);
        }
      } catch (e) {
        logger.e(`Failed to parse user info: ${e}`);
      }
    }
  }, []);

  const menuItems = [
    { label: '스티커판', onClick: () => transitionTo('/dashboard/stickers') },
    { label: '보관함', onClick: () => transitionTo('/dashboard/inventory') },
    { label: '메일함', onClick: () => transitionTo('/dashboard/mailbox') },
    { label: '타자연습 기록실', onClick: () => transitionTo('/dashboard/typing-records') },
    { label: '본오스퀘어', onClick: () => transitionTo('/dashboard/sns') },
    { label: '내 정보 수정', onClick: () => transitionTo('/dashboard/profile') },
  ];

  const teacherMenuItems = [
    { label: '스티커 지급', onClick: () => transitionTo('/dashboard/teacher/give-sticker') },
    { label: '타자 연습 기록 추가', onClick: () => { } },
  ];

  const ROLE_NAME_MAP: Record<string, string> = {
    'STUDENT': '학생',
    'TEACHER': '선생님'
  };

  return (
    <main className={layoutStyles.container}>
      <div className={styles.dashboardLayout}>
        {/* 왼쪽 카드: 일반 메뉴 */}
        <div className={layoutStyles.formCard}>
          <div className={layoutStyles.header}>
            <h3 className={layoutStyles.title}>대쉬보드 메뉴 ({userName})</h3>
            <div className={styles.userInfo}>
              {userRole && (
                <div className={styles.infoItem}>
                  <Tooltip content="권한" position="bottom">
                    <span className={styles.infoIcon}><FaUserTag /></span>
                  </Tooltip>
                  <span>{ROLE_NAME_MAP[userRole] || userRole}</span>
                </div>
              )}
              <div className={styles.infoItem}>
                <Tooltip content="이메일" position="bottom">
                  <span className={styles.infoIcon}><FaEnvelope /></span>
                </Tooltip>
                <span>{userEmail}</span>
              </div>
              <div className={styles.infoItem}>
                <Tooltip content="스티커" position="bottom">
                  <span className={styles.infoIcon}><FaStamp /></span>
                </Tooltip>
                <span>모은 스티커 {stickerCount}개</span>
              </div>
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

        {/* 오른쪽 카드: 선생님 전용 메뉴 */}
        {userRole === 'TEACHER' && (
          <div className={layoutStyles.formCard}>
            <div className={layoutStyles.header}>
              <h3 className={layoutStyles.title}>선생님 도구</h3>
            </div>

            <ActionList items={teacherMenuItems} />
          </div>
        )}
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
