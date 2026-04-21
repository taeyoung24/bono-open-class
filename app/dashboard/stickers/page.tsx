'use client';

import layoutStyles from 'app/Layout.module.css';
import { DefaultButton } from 'app/components/Button';
import Tooltip from 'app/overlays/Tooltip';
import { useTransitionNav } from 'app/providers/TransitionProvider';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { logger } from 'src/utils/log';
import styles from './stickers.module.css';

interface OwnedSticker {
  inventoryId: number;
  itemId: number;
  name: string;
  imageUrl: string;
  quantity: number;
}

interface PlacedSticker {
  id: string;        // DB에 저장 후에는 DB id (string으로 통일)
  dbId: number | null; // DB의 실제 id (저장 전엔 null)
  sticker: OwnedSticker;
  x: number;
  y: number;
}

export default function StickersPage() {
  const router = useRouter();
  const { transitionTo, setPageReady } = useTransitionNav();

  const [ownedStickers, setOwnedStickers] = useState<OwnedSticker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // 선택 모드
  const [selectedSticker, setSelectedSticker] = useState<OwnedSticker | null>(null);

  // 마우스가 보드 위에 있을 때의 커서 위치
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);
  const [isOverBoard, setIsOverBoard] = useState(false);

  // 배치된 스티커 목록
  const [placedStickers, setPlacedStickers] = useState<PlacedSticker[]>([]);
  const [movingStickerId, setMovingStickerId] = useState<string | null>(null);

  const boardRef = useRef<HTMLElement>(null);
  const mainContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user_info');
    if (!storedUser) {
      router.push('/login');
      return;
    }
    const { userId: uid } = JSON.parse(storedUser);
    setUserId(uid);
    fetchAll(uid);
  }, [router]);

  const fetchAll = async (uid: string) => {
    setPageReady(false);
    try {
      const [stickerRes, placementRes] = await Promise.all([
        fetch(`/api/user/stickers?userId=${uid}`),
        fetch(`/api/user/sticker-placements?userId=${uid}`),
      ]);

      const stickerData = await stickerRes.json();
      const placementData = await placementRes.json();

      if (stickerRes.ok) setOwnedStickers(stickerData.stickers);

      if (placementRes.ok) {
        // DB 배치 데이터를 클라이언트 상태로 변환
        const loaded: PlacedSticker[] = placementData.placements.map((p: any) => ({
          id: `db-${p.id}`,
          dbId: p.id,
          sticker: {
            inventoryId: 0, // 로딩된 배치에는 인벤토리 id 불필요
            itemId: p.itemId,
            name: p.name,
            imageUrl: p.imageUrl,
            quantity: 1,
          },
          x: p.x,
          y: p.y,
        }));
        setPlacedStickers(loaded);
      }
    } catch (error) {
      logger.e(`Failed to fetch data: ${error}`);
    } finally {
      setIsLoading(false);
      setPageReady(true);
    }
  };

  // 인벤토리 슬롯 클릭: 선택 모드 토글
  const handleStickerClick = (sticker: OwnedSticker) => {
    if (selectedSticker?.itemId === sticker.itemId && !movingStickerId) {
      setSelectedSticker(null);
    } else {
      setMovingStickerId(null);
      setSelectedSticker(sticker);
    }
  };

  // 보드 위 마우스 이동
  const handleBoardMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!selectedSticker || !mainContentRef.current) return;
    const rect = mainContentRef.current.getBoundingClientRect();
    setCursorPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  // 스티커 집어 들기 (재배치 시작)
  const handlePickUpSticker = (e: React.MouseEvent, ps: PlacedSticker) => {
    e.stopPropagation();
    if (mainContentRef.current) {
      const rect = mainContentRef.current.getBoundingClientRect();
      setCursorPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      setIsOverBoard(true);
    }
    setMovingStickerId(ps.id);
    setSelectedSticker(ps.sticker);
  };

  // 보드 위 클릭: 스티커 배치 또는 이동 완료
  const handleBoardClick = async (e: React.MouseEvent<HTMLElement>) => {
    if (!selectedSticker || !mainContentRef.current || !userId) return;

    const rect = mainContentRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    if (movingStickerId) {
      // 기존 스티커 이동
      const moving = placedStickers.find(ps => ps.id === movingStickerId);

      // 낙관적 UI 업데이트
      setPlacedStickers(prev => prev.map(ps =>
        ps.id === movingStickerId ? { ...ps, x, y } : ps
      ));

      // DB 업데이트 (dbId가 있는 경우)
      if (moving?.dbId) {
        try {
          await fetch(`/api/user/sticker-placements/${moving.dbId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ x, y }),
          });
        } catch (error) {
          logger.e(`Failed to update placement: ${error}`);
        }
      }
    } else {
      // 새 스티커 배치 (임시 id로 먼저 렌더링)
      const tempId = `temp-${Date.now()}`;
      const newPlaced: PlacedSticker = {
        id: tempId,
        dbId: null,
        sticker: selectedSticker,
        x,
        y,
      };

      setPlacedStickers(prev => [...prev, newPlaced]);

      // 인벤토리 수량 로컬 업데이트 (낙관적 UI)
      setOwnedStickers(prev => {
        return prev
          .map(s => {
            if (s.itemId === selectedSticker.itemId) {
              return { ...s, quantity: s.quantity - 1 };
            }
            return s;
          })
          .filter(s => s.quantity > 0);
      });

      // DB 저장 후 dbId 업데이트
      try {
        const res = await fetch('/api/user/sticker-placements', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, itemId: selectedSticker.itemId, x, y }),
        });
        const data = await res.json();
        if (res.ok) {
          // 임시 id를 DB id로 교체
          setPlacedStickers(prev => prev.map(ps =>
            ps.id === tempId ? { ...ps, id: `db-${data.placement.id}`, dbId: data.placement.id } : ps
          ));
        }
      } catch (error) {
        logger.e(`Failed to save placement: ${error}`);
      }
    }

    // 초기화
    setSelectedSticker(null);
    setMovingStickerId(null);
    setCursorPos(null);
    setIsOverBoard(false);
  };

  // 3x3 그리드를 위한 9개의 칸 계산
  const gridSlots = Array.from({ length: 9 }, (_, i) => ownedStickers[i] || null);

  const STICKER_GHOST_SIZE = 64;

  return (
    <main className={layoutStyles.container}>
      <div className={styles.stickersContainer}>

        {/* 왼쪽 사이드바: 폼 분리 구조 */}
        <aside className={styles.sidebar}>

          <div className={`${layoutStyles.formCard} ${styles.inventoryForm}`}>
            <div className={styles.inventoryGrid}>
              {ownedStickers.length === 0 ? (
                <div className={styles.emptyInventory}>보유한 스티커가 없습니다.</div>
              ) : (
                ownedStickers.map((sticker) => {
                  const isSelected = selectedSticker?.itemId === sticker.itemId;
                  return (
                    <Tooltip
                      key={sticker.itemId}
                      content={sticker.name}
                      position="bottom"
                    >
                      <div
                        className={`${styles.stickerSlot} ${styles.stickerSlotActive} ${isSelected ? styles.stickerSlotSelected : ''}`}
                        onClick={() => handleStickerClick(sticker)}
                      >
                        <img
                          src={sticker.imageUrl}
                          alt={sticker.name}
                          className={styles.stickerImg}
                          draggable={false}
                        />
                        {(sticker.quantity > 1) && (
                          <div className={styles.stickerBadge}>
                            {sticker.quantity > 99 ? '99+' : sticker.quantity}
                          </div>
                        )}
                      </div>
                    </Tooltip>
                  );
                })
              )}
            </div>
          </div>

          {/* 컨트롤 폼: 제목, 통계, 돌아가기 버튼 등 */}
          <div className={`${layoutStyles.formCard} ${styles.controlForm}`}>
            <div className={styles.minimalStatsLayout}>
              <div className={styles.statBox}>
                <span className={styles.statTitle}>총 스티커</span>
                <div className={styles.statHugeValueContainer}>
                  <span className={styles.statHugeValue}>{placedStickers.length}</span>
                  <span className={styles.statHugeUnit}>개</span>
                </div>
              </div>
            </div>

            <DefaultButton
              text="대쉬보드로 돌아가기"
              onClick={() => transitionTo('/dashboard')}
              variant="none"
              width="fill"
            />
          </div>
        </aside>

        {/* 오른쪽 컨텐츠 영역: 스티커 보드 */}
        <section
          ref={boardRef}
          className={`${layoutStyles.formCard} ${styles.contentArea} ${selectedSticker ? styles.boardSelectionMode : ''}`}
          onMouseMove={handleBoardMouseMove}
          onMouseEnter={() => setIsOverBoard(true)}
          onMouseLeave={() => {
            setIsOverBoard(false);
            setCursorPos(null);
          }}
          onClick={handleBoardClick}
        >
          <div className={styles.mainContent} ref={mainContentRef}>
            {/* 배치된 스티커들 */}
            {placedStickers.map((ps) => (
              <img
                key={ps.id}
                src={ps.sticker.imageUrl}
                alt={ps.sticker.name}
                className={styles.placedSticker}
                onClick={(e) => handlePickUpSticker(e, ps)}
                draggable={false}
                style={{
                  left: `${ps.x}%`,
                  top: `${ps.y}%`,
                  opacity: ps.id === movingStickerId ? 0.1 : 1,
                  cursor: movingStickerId ? 'default' : 'pointer',
                  pointerEvents: ps.id === movingStickerId ? 'none' : 'auto',
                }}
              />
            ))}

            {/* 선택 상태에서 보드 위 마우스를 따라다니는 고스트 이미지 */}
            {selectedSticker && isOverBoard && cursorPos && (
              <img
                src={selectedSticker.imageUrl}
                alt="ghost"
                className={styles.stickerGhost}
                draggable={false}
                style={{
                  left: cursorPos.x - STICKER_GHOST_SIZE / 2,
                  top: cursorPos.y - STICKER_GHOST_SIZE / 2,
                  width: STICKER_GHOST_SIZE,
                  height: STICKER_GHOST_SIZE,
                }}
              />
            )}
          </div>
        </section>

      </div>
    </main>
  );
}
