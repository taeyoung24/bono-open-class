'use client';

import ActionList from 'app/components/ActionList';
import { DefaultButton } from 'app/components/Button';
import layoutStyles from 'app/Layout.module.css';
import Tooltip from 'app/overlays/Tooltip';
import { useTransitionNav } from 'app/providers/TransitionProvider';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { TypingRecord, TypingType } from 'src/types';
import { logger } from 'src/utils/log';
import ProficiencyGauge from './ProficiencyGauge';
import styles from './typing-records.module.css';
import TypingHistoryChart from './TypingHistoryChart';
import { FaTrash } from 'react-icons/fa6';
import RecordDeleteModal from 'app/modals/RecordDeleteModal';
import AlertModal from 'app/modals/AlertModal';
import axios from 'axios';

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
  const { transitionTo, setPageReady } = useTransitionNav();
  const [userId, setUserId] = useState<string | null>(null);
  const [allRecords, setAllRecords] = useState<TypingRecord[]>([]);
  const [stats, setStats] = useState<Stats>({ totalCount: 0, avgCpm: 0, avgAccuracy: 0 });
  const [filter, setFilter] = useState<TypingType | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'analytics' | null>('analytics');
  const [isLoading, setIsLoading] = useState(true);
  const [hasFetched, setHasFetched] = useState(false);

  // 모달 및 진행 상태
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedRecordId, setSelectedRecordId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRequestingCode, setIsRequestingCode] = useState(false);
  const [alertModal, setAlertModal] = useState({ isOpen: false, title: '알림', message: '' });

  const showAlert = (message: string, title: string = '알림') => {
    setAlertModal({ isOpen: true, title, message });
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user_info');
    if (!storedUser) {
      router.push('/login');
      return;
    }

    const { userId: uid } = JSON.parse(storedUser);
    setUserId(uid);
    fetchRecords(uid);
  }, [router]);

  // 데이터 무결성 검증: 타자 기록 데이터가 모두 준비되었을 때만 연필 로더 해제
  useEffect(() => {
    if (hasFetched) {
      setPageReady(true);
    }
  }, [hasFetched, setPageReady]);

  const fetchRecords = async (userId: string) => {
    setPageReady(false); // 연필 로더 대기 시작
    try {
      const response = await fetch(`/api/typing-records?userId=${userId}`);
      const data = await response.json();
      if (response.ok) {
        setAllRecords(data.records);
        setStats(data.stats);
      }
    } catch (error) {
      logger.e(`Failed to fetch records: ${error}`);
    } finally {
      setIsLoading(false);
      setHasFetched(true);
    }
  };

  const filteredRecords = allRecords.filter(record => {
    if (filter === null) return false;
    return record.type === filter;
  });

  const formatDate = (dateValue: string | Date) => {
    const date = new Date(dateValue);
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric', month: '2-digit', day: '2-digit',
    }).format(date);
  };

  const getCount = (type: string) => {
    return allRecords.filter(r => r.type === type).length;
  };

  // 최근 20회 평균 타수 * 평균 정확도를 통한 보정 타수 계산
  const calculateAdjustedCpm = () => {
    if (allRecords.length === 0) return 0;
    const recentRecords = allRecords.slice(0, 20);
    const avgCpm = recentRecords.reduce((acc, curr) => acc + (curr.cpm || 0), 0) / recentRecords.length;
    const avgAccuracy = recentRecords.reduce((acc, curr) => acc + (curr.accuracy || 0), 0) / recentRecords.length;
    // accuracy가 0~1 사이 값이므로 그대로 곱함
    return Math.round(avgCpm * avgAccuracy);
  };

  const menuItems = [
    { label: '분석 보드', onClick: () => { setFilter(null); setViewMode('analytics'); } },
    { label: `자리 연습 (${getCount('POSITION')})`, onClick: () => { setFilter('POSITION'); setViewMode('list'); } },
    { label: `낱말 연습 (${getCount('WORD')})`, onClick: () => { setFilter('WORD'); setViewMode('list'); } },
    { label: `일반 연습 (${getCount('NORMAL')})`, onClick: () => { setFilter('NORMAL'); setViewMode('list'); } },
  ];

  // 삭제 코드 요청
  const handleRequestDeleteCode = async () => {
    if (!userId || !selectedRecordId) return;
    setIsRequestingCode(true);
    try {
      await axios.post('/api/typing-records/delete-request', { userId, recordId: selectedRecordId });
      showAlert('삭제 승인 코드가 선생님에게 전송되었습니다.');
    } catch (error: any) {
      logger.e(`Delete request error: ${error}`);
      showAlert(error.response?.data?.message || '코드 요청 중 오류가 발생했습니다.');
    } finally {
      setIsRequestingCode(false);
    }
  };

  // 삭제 실행
  const handleConfirmDelete = async (code: string) => {
    if (!userId || !selectedRecordId || !code) return;
    setIsDeleting(true);
    try {
      const response = await axios.post('/api/typing-records/delete-confirm', { 
        userId, 
        recordId: selectedRecordId, 
        code 
      });
      setIsDeleteModalOpen(false);
      showAlert(response.data.message, '삭제 완료');
      // 기록 새로고침
      fetchRecords(userId);
    } catch (error: any) {
      if (error.response?.status !== 400) {
        logger.e(`Delete confirm error: ${error}`);
      }
      showAlert(error.response?.data?.message || '삭제 처리 중 오류가 발생했습니다.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <main className={layoutStyles.container}>
      <div className={styles.layout}>
        {/* 왼쪽 카드: 통계 및 메뉴 */}
        <aside className={`${layoutStyles.formCard} ${styles.sidebar}`}>
          {/* 미니멀 통계 섹션 */}
          <div className={styles.minimalStatsLayout}>
            <div className={styles.statBox}>
              <Tooltip content="최근 10회 평균 타수 × 평균 정확도" position="right">
                <span className={styles.statTitle}>나의 타수 (보정)</span>
              </Tooltip>
              <div className={styles.statHugeValueContainer}>
                <span className={styles.statHugeValue}>{calculateAdjustedCpm()}</span>
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

          <div className={styles.sidebarFooter}>
            <DefaultButton
              text="대쉬보드로 돌아가기"
              onClick={() => transitionTo('/dashboard')}
              variant="none"
              width="fill"
            />
          </div>
        </aside>

        {/* 오른쪽 카드: 기록 리스트 또는 분석 보드 */}
        <section className={`${layoutStyles.formCard} ${styles.contentArea}`}>
          <div className={layoutStyles.header}>
            <h3 className={layoutStyles.title}>
              {viewMode === 'analytics' ? '분석 보드' : (filter ? TYPE_NAME_MAP[filter] : '연습 기록')}
              {viewMode === 'list' && filter && ` (${filteredRecords.length})`}
            </h3>
          </div>

          <div className={layoutStyles.dataList}>
            {isLoading ? (
              <div className={`${layoutStyles.dataItem} ${styles.emptyGuide}`}>로딩 중...</div>
            ) : viewMode === 'analytics' ? (
              <div className={styles.analyticsContainer}>
                {(() => {
                  const currentCpm = calculateAdjustedCpm();
                  const getTierName = (cpm: number) => {
                    if (cpm < 100) return '초보자 I';
                    if (cpm < 200) return '초보자 II';
                    if (cpm < 300) return '숙련자 I';
                    if (cpm < 400) return '숙련자 II';
                    if (cpm < 500) return '실력자 I';
                    return '실력자 II';
                  };
                  const tierName = getTierName(currentCpm);
                  return (
                    <>
                      <h5 className={styles.analyticsTitle}>현재 실력: {tierName}</h5>
                      <ProficiencyGauge currentCpm={currentCpm} />
                    </>
                  );
                })()}

                <h5 className={styles.analyticsTitle}>나의 타수 변화</h5>
                <div className={styles.chartWrapper}>
                  <TypingHistoryChart records={allRecords} />
                </div>

                <h5 className={styles.analyticsTitle}>연습 시간 변화</h5>
                <div className={styles.chartWrapper}>
                  <TypingHistoryChart records={allRecords} mode="duration" />
                </div>
              </div>
            ) : viewMode === null ? (
              <div className={`${layoutStyles.dataItem} ${styles.emptyGuide}`}>
                <p>열람할 연습 유형이나 분석 보드를 선택해 주세요.</p>
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
                          <span>
                            {(() => {
                              if (!record.duration) return '-';
                              const min = Math.floor(record.duration / 60);
                              const sec = record.duration % 60;
                              return min > 0 ? `${min}분 ${sec}초` : `${sec}초`;
                            })()}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                  <div className={`${layoutStyles.dataCol} ${layoutStyles.dataColFixed} ${styles.colDate}`}>
                    {formatDate(record.createdAt)}
                  </div>
                  <button 
                    className={styles.deleteButton} 
                    title="삭제" 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedRecordId(record.id);
                      setIsDeleteModalOpen(true);
                    }}
                  >
                    <FaTrash />
                  </button>
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

      <RecordDeleteModal
        isOpen={isDeleteModalOpen}
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
        onRequestCode={handleRequestDeleteCode}
        isLoading={isDeleting}
        isRequestingCode={isRequestingCode}
      />

      <AlertModal
        isOpen={alertModal.isOpen}
        title={alertModal.title}
        message={alertModal.message}
        onConfirm={() => setAlertModal(prev => ({ ...prev, isOpen: false }))}
      />
    </main>
  );
}
