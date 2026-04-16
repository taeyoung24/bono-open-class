'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './dashboard.module.css';
import { IoChevronForward } from 'react-icons/io5';
import { DefaultButton } from 'app/components/Button';

export default function DashboardPage() {
  const router = useRouter();
  const [userName, setUserName] = useState('사용자');

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
    { label: '메일함', path: '/dashboard/mailbox' },
    { label: '내 정보 수정', path: '/dashboard/profile' },
  ];

  return (
    <main className={styles.container}>
      <div className={styles.authCard}>
        <div className={styles.header}>
          <h3 className={styles.title}>{userName}의 작업공간</h3>
        </div>

        <nav className={styles.listContainer}>
          {menuItems.map((item, index) => (
            <button
              key={index}
              className={styles.listItem}
              onClick={() => router.push(item.path)}
            >
              <span className={styles.itemLabel}>{item.label}</span>
              <IoChevronForward className={styles.itemIcon} />
            </button>
          ))}
        </nav>

        <div className={styles.logoutSection}>
          <DefaultButton text="로그아웃" onClick={handleLogout} width='fill' />
        </div>
      </div>
    </main>
  );
}
