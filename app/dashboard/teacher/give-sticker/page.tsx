'use client';

import layoutStyles from 'app/Layout.module.css';
import SelectionList from 'app/components/SelectionList';
import { DefaultButton } from 'app/components/Button';
import TextInput from 'app/components/TextInput';
import SkeletonImage from 'app/components/loaders/SkeletonImage';
import AlertModal from 'app/modals/AlertModal';
import { useTransitionNav } from 'app/providers/TransitionProvider';
import { useEffect, useState } from 'react';
import { getUserDisplayName } from 'src/userHelpers';
import { logger } from 'src/utils/log';
import styles from './give-sticker.module.css';

export default function GiveStickerPage() {
  const { transitionBack } = useTransitionNav();

  // 데이터 공유 상태
  const [users, setUsers] = useState<any[]>([]);
  const [stickers, setStickers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 선택 상태
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [selectedSticker, setSelectedSticker] = useState<any | null>(null);
  const [quantity, setQuantity] = useState('1');

  // 모달 상태
  const [alert, setAlert] = useState({ isOpen: false, title: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([fetchUsers(), fetchStickers()]).finally(() => {
      setIsLoading(false);
    });
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

  const fetchStickers = async () => {
    try {
      const response = await fetch('/api/teacher/stickers', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
      });
      const data = await response.json();
      if (response.ok) setStickers(data.stickers);
    } catch (error) {
      logger.e(`Failed to fetch stickers: ${error}`);
    }
  };

  const handleGiveSticker = async () => {
    if (!selectedUser || !selectedSticker) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/teacher/give-sticker', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          targetUserId: selectedUser.userId,
          itemId: selectedSticker.id,
          quantity: parseInt(quantity) || 1
        })
      });
      const data = await response.json();

      if (response.ok) {
        setAlert({ isOpen: true, title: '지급 완료', message: data.message });
        // 성공 시 폼 초기화 (유저는 유지하거나 변경 가능)
        setQuantity('1');
        setSelectedSticker(null);
      } else {
        setAlert({ isOpen: true, title: '오류', message: data.message });
      }
    } catch (error) {
      setAlert({ isOpen: true, title: '오류', message: '서버와 통신 중 오류가 발생했습니다.' });
      logger.e(`Grant sticker failed: ${error}`);
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
    onClick: () => {
      setSelectedUser((prev: any) => prev?.userId === u.userId ? null : u);
      logger.d(`Toggled user selection: ${u.userId}`);
    }
  }));

  const stickerItems = stickers.map(s => ({
    label: (
      <div className={styles.stickerItemLabel}>
        <img src={s.imageUrl} alt={s.name} className={styles.stickerMiniIcon} />
        <span>{s.name}</span>
      </div>
    ),
    selected: selectedSticker?.id === s.id,
    onClick: () => setSelectedSticker((prev: any) => prev?.id === s.id ? null : s)
  }));

  return (
    <main className={layoutStyles.container}>
      <div className={styles.splitLayout}>
        {/* 왼쪽: 사용자 목록 */}
        <div className={`${layoutStyles.formCard} ${styles.leftCard}`}>
          <div className={layoutStyles.header}>
            <h3 className={layoutStyles.title}>대상 학생 선택</h3>
            <p className={layoutStyles.subtitle}>스티커를 받을 학생을 골라주세요.</p>
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

        {/* 오른쪽: 스티커 지급 폼 */}
        <div className={`${layoutStyles.formCard} ${styles.rightCard}`}>
          <div className={layoutStyles.header}>
            <h3 className={layoutStyles.title}>스티커 지급 설정</h3>
            {selectedUser ? (
              <p className={layoutStyles.subtitle}>
                <strong>{getUserDisplayName(selectedUser)}</strong> 학생에게 지급합니다.
              </p>
            ) : (
              <p className={layoutStyles.subtitle}>학생을 먼저 선택해주세요.</p>
            )}
          </div>

          <div className={`${styles.formContent} ${!selectedUser ? styles.disabled : ''}`}>
            <label className={layoutStyles.label}>지급할 스티커 종류</label>
            <div className={styles.stickerSelectionArea}>
              <SelectionList items={stickerItems} />
            </div>

            <div className={styles.fieldGroup}>
              <label className={layoutStyles.label}>지급 수량</label>
              <TextInput
                type="number"
                value={quantity}
                onChange={setQuantity}
                placeholder="지급할 개수 (예: 1)"
                disabled={!selectedUser}
              />
            </div>

            <div className={styles.actionArea}>
              <DefaultButton
                text="스티커 지급하기"
                onClick={handleGiveSticker}
                isLoading={isSubmitting}
                disabled={!selectedUser || !selectedSticker}
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
