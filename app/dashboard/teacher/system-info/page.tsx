'use client';

import layoutStyles from 'app/Layout.module.css';
import { DefaultButton } from 'app/components/Button';
import { useTransitionNav } from 'app/providers/TransitionProvider';
import { useEffect, useState } from 'react';
import { logger } from 'src/utils/log';

export default function SystemInfoPage() {
  const { transitionBack } = useTransitionNav();
  const [storageInfo, setStorageInfo] = useState<{ usedFormatted: string } | null>(null);

  useEffect(() => {
    const fetchStorage = async () => {
      try {
        const res = await fetch('/api/system/storage');
        if (res.ok) {
          const data = await res.json();
          setStorageInfo(data);
        }
      } catch (e) {
        logger.e(`Failed to fetch storage info: ${e}`);
      }
    };
    fetchStorage();
  }, []);

  return (
    <main className={layoutStyles.container}>
      <div className={layoutStyles.formCard}>
        <div className={layoutStyles.header}>
          <h3 className={layoutStyles.title}>시스템 정보</h3>
          <p className={layoutStyles.subtitle}>서버 및 서비스 운영 상태를 확인합니다.</p>
        </div>

        <div className={layoutStyles.form}>
          <div className={layoutStyles.fieldGroup}>
            <label className={layoutStyles.label}>
              메일 저장소 사용 현황
            </label>
            <div style={{
              padding: '12px 4px',
              fontSize: 'var(--font-size-base)',
              fontWeight: 'var(--font-weight-sb)',
              color: 'var(--text-main)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ color: 'var(--text-sub)', fontWeight: 'var(--font-weight-r)' }}>사용량</span>
              <span style={{ color: 'var(--accent-primary)' }}>
                {storageInfo ? storageInfo.usedFormatted : '계산 중...'}
              </span>
            </div>
          </div>

          <div style={{ marginTop: '32px' }}>
            <DefaultButton
              text="대시보드로 돌아가기"
              onClick={transitionBack}
              variant="none"
              width="fill"
            />
          </div>
        </div>
      </div>
    </main>
  );
}
