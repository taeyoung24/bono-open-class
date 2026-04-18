'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import layoutStyles from 'app/Layout.module.css';
import styles from './typing-records.module.css';
import { DefaultButton } from 'app/components/Button';
import ActionList from 'app/components/ActionList';

interface TypingRecord {
  id: number;
  cpm: number | null;
  accuracy: number | null;
  duration: number | null;
  type: string;
  createdAt: string;
}

interface Stats {
  totalCount: number;
  avgCpm: number;
  avgAccuracy: number;
}

const TYPE_NAME_MAP: Record<string, string> = {
  'ALL': '전체 기록',
  'POSITION': '자리 연습',
  'WORD': '낱말 연습',
  'NORMAL': '일반 연습'
};

const TYPE_SHORT_MAP: Record<string, string> = {
  'POSITION': '자리',
  'WORD': '낱말',
  'NORMAL': '일반'
};

export default function TypingRecordsPage() {
  const router = useRouter();
  const [allRecords, setAllRecords] = useState<TypingRecord[]>([]);
  const [stats, setStats] = useState<Stats>({ totalCount: 0, avgCpm: 0, avgAccuracy: 0 });
  const [filter, setFilter] = useState<'POSITION' | 'WORD' | 'NORMAL' | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user_info');
    if (!storedUser) {
      router.push('/login');
      return;
    }

    const { userId } = JSON.parse(storedUser);
    fetchRecords(userId);
  }, [router]);

  const fetchRecords = async (userId: string) => {
    try {
      const response = await fetch(`/api/typing-records?userId=${userId}`);
      const data = await response.json();
      if (response.ok) {
        setAllRecords(data.records);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch records:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredRecords = allRecords.filter(record => {
    if (filter === null) return false;
    return record.type === filter;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric', month: '2-digit', day: '2-digit',
    }).format(date);
  };

  const getCount = (type: string) => {
    return allRecords.filter(r => r.type === type).length;
  };

  // 최근 20회 기준 정확도 보정 타수 계산
  const calculateEffectiveCpm = () => {
    if (allRecords.length === 0) return 0;

    const recentRecords = allRecords.slice(0, 20);
    const avgCpm = recentRecords.reduce((acc, r) => acc + (r.cpm || 0), 0) / recentRecords.length;
    const avgAcc = recentRecords.reduce((acc, r) => acc + (r.accuracy || 0), 0) / recentRecords.length;

    return Math.round(avgCpm * avgAcc);
  };

  const menuItems = [
    { label: `자리 연습 (${getCount('POSITION')})`, onClick: () => setFilter('POSITION') },
    { label: `낱말 연습 (${getCount('WORD')})`, onClick: () => setFilter('WORD') },
    { label: `일반 연습 (${getCount('NORMAL')})`, onClick: () => setFilter('NORMAL') },
  ];

  return (
    <main className={layoutStyles.container}>
      <div className={styles.layout}>
        {/* 왼쪽 카드: 통계 및 메뉴 */}
        <aside className={`${layoutStyles.formCard} ${styles.sidebar}`}>
          <div className={layoutStyles.header}>
            <h3 className={layoutStyles.title}>타자연습 기록실</h3>
          </div>

          {/* 미니멀 통계 섹션 */}
          <div className={styles.minimalStatsLayout}>
            <div className={styles.statBox}>
              <span className={styles.statTitle}>나의 타수</span>
              <div className={styles.statHugeValueContainer}>
                <span className={styles.statHugeValue}>{calculateEffectiveCpm()}</span>
                <span className={styles.statHugeUnit}>타</span>
              </div>
            </div>

            <div className={styles.statDivider}></div>

            <div className={styles.statBox}>
              <span className={styles.statTitle}>누적 연습</span>
              <div className={styles.statHugeValueContainer}>
                <span className={styles.statHugeValue}>{stats.totalCount}</span>
                <span className={styles.statHugeUnit}>회</span>
              </div>
            </div>
          </div>

          <ActionList items={menuItems} />

          <div style={{ marginTop: 'auto', paddingTop: '32px' }}>
            <DefaultButton
              text="대시보드로 돌아가기"
              onClick={() => router.push('/dashboard')}
              variant="none"
              width="fill"
            />
          </div>
        </aside>

        {/* 오른쪽 카드: 기록 리스트 (Mailbox 스타일 100% 적용) */}
        <section className={`${layoutStyles.formCard} ${styles.contentArea}`}>
          <div className={layoutStyles.header}>
            <h3 className={layoutStyles.title}>
              {filter ? TYPE_NAME_MAP[filter] : '연습 기록'} {filter && `(${filteredRecords.length})`}
            </h3>
          </div>

          <div className={layoutStyles.dataList}>
            {isLoading ? (
              <div className={layoutStyles.dataItem} style={{ justifyContent: 'center', cursor: 'default' }}>로딩 중...</div>
            ) : filter === null ? (
              <div className={layoutStyles.dataItem} style={{ justifyContent: 'center', cursor: 'default', padding: '80px 20px', color: 'var(--text-muted)', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <p>열람할 연습 유형을 선택해 주세요.</p>
              </div>
            ) : filteredRecords.length > 0 ? (
              filteredRecords.map((record) => (
                <div key={record.id} className={layoutStyles.dataItem}>
                  <div className={`${layoutStyles.dataCol} ${layoutStyles.dataColGrow} ${styles.colStats}`}>
                    {/* 일반 연습: CPM & 정확도 */}
                    {record.type === 'NORMAL' && (
                      <>
                        <div className={styles.statUnit}>
                          <span>{record.cpm ?? '-'} CPM</span>
                        </div>
                        <div className={styles.statUnit}>
                          <span>{record.accuracy !== null ? Math.round(record.accuracy * 100) : '-'}%</span>
                        </div>
                      </>
                    )}
                    {/* 자리/낱말 연습: 정확도 & 소요시간 */}
                    {(record.type === 'POSITION' || record.type === 'WORD') && (
                      <>
                        <div className={styles.statUnit}>
                          <span>{record.accuracy !== null ? Math.round(record.accuracy * 100) : '-'}%</span>
                        </div>
                        <div className={styles.statUnit}>
                          <span>{record.duration ?? '-'}초</span>
                        </div>
                      </>
                    )}
                  </div>
                  <div className={`${layoutStyles.dataCol} ${layoutStyles.dataColFixed} ${styles.colDate}`}>
                    {formatDate(record.createdAt)}
                  </div>
                </div>
              ))
            ) : (
              <div className={layoutStyles.dataItem} style={{ justifyContent: 'center', cursor: 'default', padding: '40px' }}>
                표시할 기록이 없습니다.
              </div>
            )}
          </div>
        </section>
      </div>

      <div className={layoutStyles.bottomFooter}>
        <p>© 2026 Bono Open Class. All rights reserved.</p>
      </div>
    </main>
  );
}
