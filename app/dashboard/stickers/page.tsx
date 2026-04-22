'use client';

import layoutStyles from 'app/Layout.module.css';
import { DefaultButton } from 'app/components/Button';
import Tooltip from 'app/overlays/Tooltip';
import AlertModal from 'app/modals/AlertModal';
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

const BACKGROUND_COLORS = [
  { value: '#ffffff', label: '하양' },
  { value: '#ff8787', label: '빨강' },
  { value: '#ffd8a8', label: '주황' },
  { value: '#ffe066', label: '노랑' },
  { value: '#b2f2bb', label: '초록' },
  { value: '#96f2d7', label: '민트' },
  { value: '#a5d8ff', label: '하늘' },
  { value: '#748ffc', label: '파랑' },
  { value: '#d0bfff', label: '보라' },
  { value: '#ffc9c9', label: '분홍' },
];

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

  // 페이지 정보
  const [pages, setPages] = useState<any[]>([]);
  const [currentPageId, setCurrentPageId] = useState<number | null>(null);
  const [currentPageTitle, setCurrentPageTitle] = useState<string>('');
  const [backgroundColor, setBackgroundColor] = useState<string>('#ffffff');
  const [totalPlacedCount, setTotalPlacedCount] = useState<number>(0);
  const [placedStickerTypesCount, setPlacedStickerTypesCount] = useState<number>(0);
  const [placedItemIds, setPlacedItemIds] = useState<number[]>([]);

  // 중복 생성 방지용 Ref
  const isCreatingPage = useRef(false);

  // 모달 알림
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

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
      // 1. 스티커 목록, 페이지 목록, 그리고 전체 배치 정보를 가져옴
      const [stickerRes, pagesRes, allPlacementsRes] = await Promise.all([
        fetch(`/api/user/stickers?userId=${uid}`),
        fetch(`/api/user/sticker-pages?userId=${uid}`),
        fetch(`/api/user/sticker-placements?userId=${uid}&all=true`),
      ]);

      const stickerData = await stickerRes.json();
      const pagesData = await pagesRes.json();
      const allPlacementsData = await allPlacementsRes.json();

      if (stickerRes.ok) setOwnedStickers(stickerData.stickers);
      if (allPlacementsRes.ok) {
        const placements = allPlacementsData.placements || [];
        setTotalPlacedCount(placements.length);

        // 고유 종류 및 ID 목록 초기화
        const uniqueIds = Array.from(new Set(placements.map((p: any) => p.itemId))) as number[];
        setPlacedItemIds(uniqueIds);
        setPlacedStickerTypesCount(uniqueIds.length);

        // [로드 시점 자동 생성 체크]
        if (pagesData.pages && pagesData.pages.length > 0) {
          const sortedPages = [...pagesData.pages].sort((a, b) => a.pageNumber - b.pageNumber);
          const lastPage = sortedPages[sortedPages.length - 1];
          const lastPageCount = placements.filter((p: any) => Number(p.pageId) === Number(lastPage.id)).length;

          if (lastPageCount >= 30) {
            await createNewPage(uid, sortedPages.length + 1);
          }
        }
      }

      if (pagesRes.ok && pagesData.pages.length > 0) {
        setPages(pagesData.pages);
        // 기본값으로 첫 번째 페이지 선택
        const firstPage = pagesData.pages[0];
        setCurrentPageId(firstPage.id);
        setCurrentPageTitle(firstPage.title || '첫 번째 페이지');
        setBackgroundColor(firstPage.backgroundColor || '#ffffff');

        // 2. 해당 페이지의 배치 정보 가져오기
        await fetchPlacements(firstPage.id, uid);
      } else {
        // 페이지가 아예 없는 경우 (API에서 자동 생성해줄 테지만 방어 코드)
        const placementRes = await fetch(`/api/user/sticker-placements?userId=${uid}`);
        const placementData = await placementRes.json();
        if (placementRes.ok) {
          setCurrentPageId(placementData.pageId);
          await fetchPlacements(placementData.pageId, uid);
          // 페이지 목록 재조회
          const pRes = await fetch(`/api/user/sticker-pages?userId=${uid}`);
          const pData = await pRes.json();
          if (pRes.ok) setPages(pData.pages);
        }
      }
    } catch (error) {
      logger.e(`Failed to fetch data: ${error}`);
    } finally {
      setIsLoading(false);
      setPageReady(true);
    }
  };

  const fetchPlacements = async (pageId: number, uid: string) => {
    try {
      // 특정 페이지의 배치를 가져오는 API
      const res = await fetch(`/api/user/sticker-placements?userId=${uid}&pageId=${pageId}`);
      const data = await res.json();
      if (res.ok) {
        const loaded: PlacedSticker[] = data.placements.map((p: any) => ({
          id: `db-${p.id}`,
          dbId: p.id,
          sticker: {
            inventoryId: 0,
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
      logger.e(`Failed to fetch placements: ${error}`);
    }
  };

  // 새 페이지 생성 공통 함수
  const createNewPage = async (uid: string, nextNumber: number) => {
    if (isCreatingPage.current) return;
    isCreatingPage.current = true;

    try {
      const res = await fetch('/api/user/sticker-pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: uid,
          pageNumber: nextNumber,
          title: `${nextNumber}쪽`
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setPages(prev => [...prev, data.page].sort((a, b) => a.pageNumber - b.pageNumber));
      }
    } catch (error) {
      logger.e(`Failed to auto-create page: ${error}`);
    } finally {
      isCreatingPage.current = false;
    }
  };

  const handleColorChange = async (color: string) => {
    if (!currentPageId) return;
    setBackgroundColor(color);
    // 페이지 목록 상태도 업데이트 (로컬)
    setPages(prev => prev.map(p => p.id === currentPageId ? { ...p, backgroundColor: color } : p));

    try {
      await fetch(`/api/user/sticker-pages/${currentPageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ backgroundColor: color }),
      });
    } catch (error) {
      logger.e(`Failed to update background color: ${error}`);
    }
  };

  const handlePrevPage = () => {
    if (pages.length <= 1 || !currentPageId) return;
    const currentIndex = pages.findIndex(p => p.id === currentPageId);
    const prevIndex = (currentIndex - 1 + pages.length) % pages.length;
    const prevPage = pages[prevIndex];

    setCurrentPageId(prevPage.id);
    setCurrentPageTitle(prevPage.title || '');
    setBackgroundColor(prevPage.backgroundColor || '#ffffff');
    fetchPlacements(prevPage.id, userId!);
  };

  const handleNextPage = () => {
    if (pages.length <= 1 || !currentPageId) return;
    const currentIndex = pages.findIndex(p => p.id === currentPageId);
    const nextIndex = (currentIndex + 1) % pages.length;
    const nextPage = pages[nextIndex];

    setCurrentPageId(nextPage.id);
    setCurrentPageTitle(nextPage.title || '');
    setBackgroundColor(nextPage.backgroundColor || '#ffffff');
    fetchPlacements(nextPage.id, userId!);
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
          body: JSON.stringify({
            userId,
            itemId: selectedSticker.itemId,
            x,
            y,
            pageId: currentPageId
          }),
        });
        const data = await res.json();
        if (res.ok) {
          // 임시 id를 DB id로 교체 및 전체 카운트 증가
          setPlacedStickers(prev => prev.map(ps =>
            ps.id === tempId ? { ...ps, id: `db-${data.placement.id}`, dbId: data.placement.id } : ps
          ));
          setTotalPlacedCount(prev => prev + 1);

          // 고유 종류 업데이트 (로컬 최적화)
          const totalRes = await fetch(`/api/user/sticker-placements?userId=${userId}`);
          const totalData = await totalRes.json();
          if (totalRes.ok) {
            setPlacedStickerTypesCount(new Set(totalData.placements.map((p: any) => p.itemId)).size);

            // [배치 시점 자동 생성 체크]
            // 현재 페이지가 가득 찼고(30개), 이것이 마지막 페이지라면 다음 페이지 생성
            const sortedPages = [...pages].sort((a, b) => a.pageNumber - b.pageNumber);
            const lastPage = sortedPages[sortedPages.length - 1];
            const currentPagePlacementsCount = placedStickers.length + 1; // 방금 붙인 것 포함

            if (currentPageId === lastPage.id && currentPagePlacementsCount >= 30) {
              await createNewPage(userId!, sortedPages.length + 1);
            }
          }
        } else {
          // 에러 발생 시 낙관적 업데이트 롤백
          setPlacedStickers(prev => prev.filter(ps => ps.id !== tempId));
          // 인벤토리 수량 원복
          setOwnedStickers(prev => {
            const exists = prev.find(s => s.itemId === selectedSticker.itemId);
            if (exists) {
              return prev.map(s => s.itemId === selectedSticker.itemId ? { ...s, quantity: s.quantity + 1 } : s);
            } else {
              return [...prev, { ...selectedSticker, quantity: 1 }].sort((a, b) => a.itemId - b.itemId);
            }
          });

          setAlertMessage(data.message || '스티커를 배치하는 중 오류가 발생했습니다.');
          setIsAlertOpen(true);
        }
      } catch (error) {
        logger.e(`Failed to save placement: ${error}`);
        setAlertMessage('네트워크 오류가 발생했습니다.');
        setIsAlertOpen(true);
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
            <div
              className={styles.inventoryGrid}
              onWheel={(e) => {
                if (e.deltaY !== 0) {
                  e.currentTarget.scrollLeft += e.deltaY;
                }
              }}
            >
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

          {/* 배경색 및 설정 폼 */}
          <div className={`${layoutStyles.formCard} ${styles.controlForm}`}>
            <div className={styles.minimalStatsLayout}>
              <div className={styles.statBox}>
                <span className={styles.statTitle}>총 스티커</span>
                <div className={styles.statHugeValueContainer}>
                  <span className={styles.statHugeValue}>{totalPlacedCount}</span>
                  <span className={styles.statHugeUnit}>개</span>
                </div>
              </div>

              <div className={styles.statDivider}></div>

              <div className={styles.statBox}>
                <span className={styles.statTitle}>스티커 종류</span>
                <div className={styles.statHugeValueContainer}>
                  <span className={styles.statHugeValue}>{placedStickerTypesCount}</span>
                  <span className={styles.statHugeUnit}>종</span>
                </div>
              </div>
            </div>

            <div className={layoutStyles.fieldGroup} style={{ padding: '12px 0' }}>
              <label className={layoutStyles.label}>
                {pages.find(p => p.id === currentPageId)?.pageNumber || 1}쪽 배경 색상
              </label>
              <div className={styles.colorPickerGrid}>
                {BACKGROUND_COLORS.map(color => (
                  <Tooltip key={color.value} content={color.label} position="top">
                    <div
                      className={`${styles.colorOption} ${backgroundColor === color.value ? styles.colorOptionSelected : ''}`}
                      style={{ backgroundColor: color.value }}
                      onClick={() => handleColorChange(color.value)}
                    />
                  </Tooltip>
                ))}
              </div>
            </div>

            <div className={styles.pageNavRow}>
              {(() => {
                const currentIndex = pages.findIndex(p => p.id === currentPageId);
                const prevPageObj = pages[(currentIndex - 1 + pages.length) % pages.length];
                const nextPageObj = pages[(currentIndex + 1) % pages.length];
                
                return (
                  <>
                    <Tooltip 
                      className={styles.navTooltip}
                      content={pages.length > 1 ? `${prevPageObj?.pageNumber || 1}쪽` : ''} 
                      position="top"
                    >
                      <DefaultButton
                        text="이전"
                        onClick={handlePrevPage}
                        variant="none"
                        width="fill"
                        disabled={pages.length <= 1}
                      />
                    </Tooltip>
                    <Tooltip 
                      className={styles.navTooltip}
                      content={pages.length > 1 ? `${nextPageObj?.pageNumber || 1}쪽` : ''} 
                      position="top"
                    >
                      <DefaultButton
                        text="다음"
                        onClick={handleNextPage}
                        variant="none"
                        width="fill"
                        disabled={pages.length <= 1}
                      />
                    </Tooltip>
                  </>
                );
              })()}
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
          style={{ backgroundColor: backgroundColor }}
          onMouseMove={handleBoardMouseMove}
          onMouseEnter={() => setIsOverBoard(true)}
          onMouseLeave={() => {
            setIsOverBoard(false);
            setCursorPos(null);
          }}
          onClick={handleBoardClick}
        >
          <div className={styles.mainContent} ref={mainContentRef}>
            {/* 배경 가이드 그리드 (6x5, 30개 원) */}
            <div className={styles.backgroundGrid}>
              {Array.from({ length: 30 }).map((_, i) => (
                <div key={i} className={styles.gridCell}>
                  <div className={styles.dotCircle} />
                </div>
              ))}
            </div>

            {/* 배경 안내 문구 */}
            <div className={styles.boardLabel}>
              스티커를 채워넣으세요<br />
              {pages.find(p => p.id === currentPageId)?.pageNumber || 1}쪽 {placedStickers.length}/30개 ({Number(((placedStickers.length / 30) * 100).toFixed(1))}%)
            </div>

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

      <AlertModal
        isOpen={isAlertOpen}
        title="페이지 가득 참"
        message={alertMessage}
        onConfirm={() => setIsAlertOpen(false)}
      />
    </main>
  );
}
