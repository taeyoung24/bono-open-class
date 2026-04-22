'use client';

import layoutStyles from 'app/Layout.module.css';
import { DefaultButton } from 'app/components/Button';
import SelectInput from 'app/components/SelectInput';
import SelectionList from 'app/components/SelectionList';
import TextInput from 'app/components/TextInput';
import SkeletonImage from 'app/components/loaders/SkeletonImage';
import AlertModal from 'app/modals/AlertModal';
import { useTransitionNav } from 'app/providers/TransitionProvider';
import { useEffect, useState } from 'react';
import { FaAsterisk } from 'react-icons/fa';
import { TypingType } from 'src/types';
import { getUserDisplayName } from 'src/userHelpers';
import { logger } from 'src/utils/log';
import styles from './add-typing-record.module.css';

export default function AddTypingRecordPage() {
  const { transitionBack } = useTransitionNav();

  // 데이터 상태
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 입력 상태
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [cpm, setCpm] = useState('');
  const [accuracy, setAccuracy] = useState('');
  const [duration, setDuration] = useState('');
  const [type, setType] = useState<TypingType>('NORMAL');

  // UI 상태
  const [alert, setAlert] = useState({ isOpen: false, title: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers().finally(() => setIsLoading(false));
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/teacher/users', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
      });
      const data = await response.json();
      if (response.ok) setUsers(data.users);
    } catch (error) {
      logger.e(`Failed to fetch users: ${error}`);
    }
  };

  const handleAddRecord = async () => {
    const isNormal = type === 'NORMAL';
    const isRequiredFilled = isNormal 
      ? (cpm && accuracy) 
      : (duration && accuracy);

    if (!selectedUser || !isRequiredFilled) {
      setAlert({ isOpen: true, title: '입력 부족', message: '필수 항목(*)을 모두 입력해주세요.' });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/teacher/add-typing-record', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          userId: selectedUser.userId,
          cpm: parseInt(cpm) || 0,
          accuracy: parseFloat(accuracy),
          duration: parseInt(duration) || 0,
          type
        })
      });
      const data = await response.json();

      if (response.ok) {
        setAlert({ isOpen: true, title: '추가 완료', message: '타자 연습 기록이 성공적으로 등록되었습니다.' });
        setCpm('');
        setAccuracy('');
        setDuration('');
      } else {
        setAlert({ isOpen: true, title: '오류', message: data.message });
      }
    } catch (error) {
      setAlert({ isOpen: true, title: '오류', message: '서버와 통신 중 오류가 발생했습니다.' });
      logger.e(`Add typing record failed: ${error}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const userItems = users.map(u => ({
    label: (
      <div className={styles.userItemLabel}>
        <SkeletonImage
          src={u.profileImage || '/app/logo-square-256.png'}
          alt={u.userId}
          width={32}
          height={32}
          className={styles.userMiniProfile}
        />
        <div className={styles.userTextInfo}>
          <span className={styles.userName}>{getUserDisplayName(u)}</span>
          <span className={styles.userId}>{u.userId}</span>
        </div>
      </div>
    ),
    selected: selectedUser?.userId === u.userId,
    onClick: () => setSelectedUser((prev: any) => prev?.userId === u.userId ? null : u)
  }));

  const typingTypeOptions = [
    { value: 'POSITION', label: '자리 연습' },
    { value: 'WORD', label: '낱말 연습' },
    { value: 'NORMAL', label: '일반 연습' }
  ];

  return (
    <main className={layoutStyles.container}>
      <div className={styles.splitLayout}>
        {/* 왼쪽: 학생 목록 */}
        <div className={`${layoutStyles.formCard} ${styles.leftCard}`}>
          <div className={layoutStyles.header}>
            <h3 className={layoutStyles.title}>대상 학생 선택</h3>
            <p className={layoutStyles.subtitle}>기록을 추가할 학생을 선택하세요.</p>
          </div>
          <div className={styles.scrollArea}>
            {isLoading ? (
              <div className={styles.loadingBox}>목록을 불러오는 중...</div>
            ) : (
              <SelectionList items={userItems} />
            )}
          </div>
          <div className={layoutStyles.footer}>
            <DefaultButton
              text="돌아가기"
              onClick={transitionBack}
              variant="none"
              width="fill"
            />
          </div>
        </div>

        {/* 오른쪽: 기록 입력 폼 */}
        <div className={`${layoutStyles.formCard} ${styles.rightCard}`}>
          <div className={layoutStyles.header}>
            <h3 className={layoutStyles.title}>타자 연습 기록 입력</h3>
            {selectedUser ? (
              <p className={layoutStyles.subtitle}>
                <strong>{getUserDisplayName(selectedUser)}</strong> 학생의 기록을 입력합니다.
              </p>
            ) : (
              <p className={layoutStyles.subtitle}>학생을 먼저 선택해주세요.</p>
            )}
          </div>

          <div className={`${styles.formContent} ${!selectedUser ? styles.disabled : ''}`}>
            <div className={styles.fieldGroup}>
              <label className={layoutStyles.label}>
                연습 종류
                <FaAsterisk className={layoutStyles.requiredIcon} size={8} />
              </label>
              <SelectInput
                value={type}
                onChange={(val) => setType(val as TypingType)}
                options={typingTypeOptions}
                disabled={!selectedUser}
              />
            </div>

            <div className={styles.fieldRow}>
              <div className={styles.fieldGroup}>
                <label className={layoutStyles.label}>
                  타수 (CPM)
                  {type === 'NORMAL' && <FaAsterisk className={layoutStyles.requiredIcon} size={8} />}
                </label>
                <TextInput
                  type="number"
                  value={cpm}
                  onChange={setCpm}
                  placeholder="예: 350"
                  disabled={!selectedUser}
                />
              </div>
              <div className={styles.fieldGroup}>
                <label className={layoutStyles.label}>
                  정확도 (%)
                  <FaAsterisk className={layoutStyles.requiredIcon} size={8} />
                </label>
                <TextInput
                  type="number"
                  value={accuracy}
                  onChange={setAccuracy}
                  placeholder="예: 98"
                  disabled={!selectedUser}
                />
              </div>
            </div>

            <div className={styles.fieldGroup}>
              <label className={layoutStyles.label}>
                연습 시간 (초)
                {type !== 'NORMAL' && <FaAsterisk className={layoutStyles.requiredIcon} size={8} />}
              </label>
              <TextInput
                type="number"
                value={duration}
                onChange={setDuration}
                placeholder={type === 'NORMAL' ? "예: 60 (선택사항)" : "예: 60"}
                disabled={!selectedUser}
              />
            </div>

            <div className={styles.actionArea}>
              <DefaultButton
                text="기록 추가하기"
                onClick={handleAddRecord}
                isLoading={isSubmitting}
                disabled={!selectedUser || (type === 'NORMAL' ? (!cpm || !accuracy) : (!duration || !accuracy))}
                width="fill"
              />
            </div>
          </div>
        </div>
      </div>

      <AlertModal
        isOpen={alert.isOpen}
        title={alert.title}
        message={alert.message}
        onConfirm={() => setAlert({ ...alert, isOpen: false })}
      />
    </main>
  );
}
