'use client';

import layoutStyles from 'app/Layout.module.css';
import { DefaultButton } from 'app/components/Button';
import Tooltip from 'app/overlays/Tooltip';
import { useTransitionNav } from 'app/providers/TransitionProvider';
import { useEffect, useState } from 'react';
import { FaBoxOpen } from 'react-icons/fa6';
import { logger } from 'src/utils/log';
import styles from './inventory.module.css';

export default function InventoryPage() {
  const { transitionTo, setPageReady } = useTransitionNav();
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasFetched, setHasFetched] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const fetchInventory = async (uid: string) => {
    try {
      const response = await fetch(`/api/user/inventory?userId=${uid}`);
      if (response.ok) {
        const data = await response.json();
        setItems(data.items);
      }
    } catch (error) {
      logger.e(`Failed to fetch inventory: ${error}`);
    } finally {
      setIsLoading(false);
      setHasFetched(true);
    }
  };

  useEffect(() => {
    // 인벤토리 최초 진입 시에만 전역 연필 로더 대기 명령
    setPageReady(false);
  }, [setPageReady]);

  useEffect(() => {
    // 로컬 스토리지에서 사용자 정보 가져오기 (마운트 시 1회)
    const storedUser = localStorage.getItem('user_info');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setUserId(user.userId);
      } catch (e) {
        logger.e(`Failed to parse user info: ${e}`);
      }
    } else {
      transitionTo('/login');
    }
  }, [transitionTo]);

  useEffect(() => {
    // userId가 준비되면 데이터 페칭 시작
    if (userId) {
      fetchInventory(userId);
    }
  }, [userId]);

  useEffect(() => {
    // 데이터 무결성 검증: 인벤토리 데이터가 준비되었을 때만 연필 로더 해제
    if (hasFetched) {
      setPageReady(true);
    }
  }, [hasFetched, setPageReady]);

  // 5x4 그리드를 위한 20개의 슬롯 생성
  const totalSlots = 20;
  const slots = Array.from({ length: totalSlots }, (_, i) => items[i] || null);

  return (
    <main className={layoutStyles.container}>
      <div className={styles.inventoryContainer}>
        {/* 좌측 사이드바: 컨트롤 폼 */}
        <aside className={styles.sidebar}>
          <div className={`${layoutStyles.formCard} ${styles.controlForm}`}>
            <DefaultButton
              text="대쉬보드로 돌아가기"
              onClick={() => transitionTo('/dashboard')}
              variant="none"
              width="fill"
            />
          </div>
        </aside>

        {/* 우측 컨텐츠 영역: 5x4 그리드 */}
        <section className={`${layoutStyles.formCard} ${styles.contentArea}`}>
          <div className={styles.titleSection}>
            <h2 className={styles.title}>내 보관함 ({items.length})</h2>
          </div>

          <div className={styles.gridContainer}>
            {slots.map((item, index) => (
              <div
                key={index}
                className={`${styles.gridSlot} ${item ? styles.hasItem : ''}`}
              >
                {item ? (
                  <Tooltip
                    content={`${item.name}${item.description ? ` - ${item.description}` : ''}`}
                    position="bottom"
                  >
                    <div className={styles.itemContainer}>
                      <img src={item.imageUrl} alt={item.name} className={styles.itemImage} />
                      {item.quantity > 1 && (
                        <div className={styles.quantityBadge}>
                          {item.quantity > 99 ? '99+' : item.quantity}
                        </div>
                      )}
                    </div>
                  </Tooltip>
                ) : (
                  // 빈 슬롯일 경우 아이콘 표시
                  <FaBoxOpen className={styles.emptyIcon} />
                )}
              </div>
            ))}
          </div>

          <div className={styles.pagination}>
            <DefaultButton
              text="이전"
              onClick={() => { }} // 추후 페이지 전환 로직 연동
              variant="none"
              width="hug"
            />
            <span className={styles.pageIndicator}>1 / 1</span>
            <DefaultButton
              text="다음"
              onClick={() => { }} // 추후 페이지 전환 로직 연동
              variant="none"
              width="hug"
            />
          </div>
        </section>
      </div>
    </main>
  );
}
