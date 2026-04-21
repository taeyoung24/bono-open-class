'use client';

import layoutStyles from 'app/Layout.module.css';
import { DefaultButton } from 'app/components/Button';
import { useTransitionNav } from 'app/providers/TransitionProvider';
import { useEffect, useState } from 'react';
import { FaBoxOpen } from 'react-icons/fa6';
import styles from './inventory.module.css';

export default function InventoryPage() {
  const { transitionTo, setPageReady } = useTransitionNav();
  const [items, setItems] = useState<any[]>([]); // 추후 아이템 데이터 연동
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 초기 로딩 시뮬레이션 및 데이터 준비
    const timer = setTimeout(() => {
      setIsLoading(false);
      setPageReady(true);
    }, 500);

    return () => clearTimeout(timer);
  }, [setPageReady]);

  // 5x4 그리드를 위한 20개의 슬롯 생성
  const totalSlots = 20;
  const slots = Array.from({ length: totalSlots }, (_, i) => items[i] || null);

  return (
    <main className={layoutStyles.container}>
      <div className={styles.inventoryContainer}>
        {/* 좌측 사이드바: 컨트롤 폼 */}
        <aside className={styles.sidebar}>
          <div className={`${layoutStyles.formCard} ${styles.controlForm}`}>
            <div className={styles.statsBox}>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>보유 아이템</span>
                <div className={styles.statValueContainer}>
                  <span className={styles.statHugeValue}>{items.length}</span>
                  <span className={styles.statHugeUnit}>개</span>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '24px' }}>
              <DefaultButton
                text="대쉬보드로 돌아가기"
                onClick={() => transitionTo('/dashboard')}
                variant="none"
                width="fill"
              />
            </div>
          </div>
        </aside>

        {/* 우측 컨텐츠 영역: 5x4 그리드 */}
        <section className={`${layoutStyles.formCard} ${styles.contentArea}`}>
          <div className={styles.titleSection}>
            <h2 className={styles.title}>내 보관함</h2>
          </div>

          <div className={styles.gridContainer}>
            {slots.map((item, index) => (
              <div key={index} className={`${styles.gridSlot} ${item ? styles.hasItem : ''}`}>
                {item ? (
                  // 아이템이 있을 경우 표시 (추후 구현)
                  <div className={styles.itemIcon}>Item</div>
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
              onClick={() => {}} // 추후 페이지 전환 로직 연동
              variant="none"
              width="hug"
            />
            <span className={styles.pageIndicator}>1 / 1</span>
            <DefaultButton
              text="다음"
              onClick={() => {}} // 추후 페이지 전환 로직 연동
              variant="none"
              width="hug"
            />
          </div>
        </section>
      </div>
    </main>
  );
}
