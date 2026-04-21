'use client';

import layoutStyles from 'app/Layout.module.css';
import { DefaultButton } from 'app/components/Button';
import { useTransitionNav } from 'app/providers/TransitionProvider';
import { useEffect } from 'react';
import styles from './stickers.module.css';

export default function StickersPage() {
  const { transitionTo, setPageReady } = useTransitionNav();

  useEffect(() => {
    // 페이지 진입 시 로더 해제
    setPageReady(false);
    
    // 데이터 로딩이나 초기화가 필요하다면 여기서 수행
    // 현재는 빈 페이지이므로 즉시 완료 처리
    const timer = setTimeout(() => {
      setPageReady(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [setPageReady]);

  return (
    <main className={layoutStyles.container}>
      <div className={styles.stickersContainer}>
        
        {/* 왼쪽 사이드바: 뒤로가기 버튼 */}
        <aside className={`${layoutStyles.formCard} ${styles.sidebar}`}>
          <div style={{ marginTop: '0' }}>
            <DefaultButton
              text="대쉬보드로 돌아가기"
              onClick={() => transitionTo('/dashboard')}
              variant="none"
              width="fill"
            />
          </div>
        </aside>

        {/* 오른쪽 컨텐츠 영역: 스티커 판 */}
        <section className={`${layoutStyles.formCard} ${styles.contentArea}`}>
          <div className={styles.mainContent}>
            {/* 스티커 판이 들어갈 자리 (현재는 빈 폼) */}
          </div>
        </section>

      </div>
    </main>
  );
}
