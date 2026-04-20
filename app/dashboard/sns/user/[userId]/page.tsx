'use client';

import layoutStyles from 'app/Layout.module.css';
import { DefaultButton } from 'app/components/Button';
import PostCard from 'app/components/PostCard';
import SkeletonImage from 'app/components/loaders/SkeletonImage';
import styles from 'app/dashboard/sns/sns.module.css';
import AlertModal from 'app/modals/AlertModal';
import { useTransitionNav } from 'app/providers/TransitionProvider';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { getUserDisplayName } from 'src/userHelpers';
import { logger } from 'src/utils/log';

export default function UserProfilePage() {
  const router = useRouter();
  const { transitionTo, setPageReady } = useTransitionNav();
  const params = useParams();
  const targetUserId = params.userId;

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasFetched, setHasFetched] = useState(false);

  // 모달 상태
  const [modal, setModal] = useState({
    isOpen: false,
    title: '알림',
    message: '',
    onConfirm: () => setModal(prev => ({ ...prev, isOpen: false }))
  });

  const showAlert = (message: string, onConfirm?: () => void, title: string = '알림') => {
    setModal({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        if (onConfirm) onConfirm();
        setModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`/api/sns/users/${targetUserId}`);
      setProfile(response.data.profile);
      setPosts(response.data.posts);
    } catch (error) {
      logger.e(`Fetch user profile error: ${error}`);
      showAlert('사용자 정보를 불러올 수 없습니다.', () => {
        router.push('/dashboard/sns');
      });
    } finally {
      setIsLoading(false);
      setHasFetched(true);
    }
  }, [targetUserId, router]);

  // 최초 진입 시 1회만 연필 로더 대기 명령
  useEffect(() => {
    setPageReady(false);
  }, [setPageReady]);

  // 데이터 무결성 검증: 프로필 데이터가 준비되었을 때만 연필 로더 해제
  useEffect(() => {
    if (profile && hasFetched) {
      setPageReady(true);
    }
  }, [profile, hasFetched, setPageReady]);

  useEffect(() => {
    const storedUser = localStorage.getItem('user_info');
    if (!storedUser) {
      router.push('/login');
      return;
    }
    setCurrentUser(JSON.parse(storedUser));
    fetchData();
  }, [fetchData, router]);

  return (
    <main className={layoutStyles.container}>
      <div className={styles.layoutContainer}>
        {/* 왼쪽 사이드바: 타인 프로필 정보 카드 (메일함 구조 차용) */}
        <aside className={`${layoutStyles.formCard} ${styles.sidebar}`}>
          <div className={styles.sidebarProfileSection}>
            <SkeletonImage
              src={profile?.profileImage || '/app/logo-square-256.png'}
              alt="Profile"
              width={100}
              height={100}
              className={styles.miniProfileImage}
            />
            <div className={styles.miniProfileInfo}>
              {profile ? (
                <>
                  <span className={styles.miniNickname}>{getUserDisplayName(profile)}</span>
                  <span className={styles.miniBio}>{profile.bio || '자기소개가 없습니다.'}</span>
                </>
              ) : (
                <>
                  <span className={styles.miniNickname} style={{ opacity: 0.3 }}>로딩 중...</span>
                  <span className={styles.miniBio} style={{ opacity: 0.3 }}>프로필을 가져오고 있습니다.</span>
                </>
              )}
            </div>
          </div>

          <div className={styles.sidebarFooter}>
            <DefaultButton
              text="돌아가기"
              onClick={() => transitionTo('/dashboard/sns')}
              variant="none"
              width="fill"
            />
          </div>
        </aside>

        {/* 오른쪽 메인 컨텐츠: 해당 사용자의 게시글 목록 */}
        <section className={styles.contentArea}>
          <div className={`${layoutStyles.formCard} ${styles.contentCard}`}>
            <h4 className={`${layoutStyles.title} ${styles.titleSmallMargin}`}>
              {profile ? `${getUserDisplayName(profile)} 님의 활동` : '...'}
            </h4>
            <p className={layoutStyles.subtitle}>
              {profile ? `총 ${posts.length}개의 글을 남겼습니다.` : '정보를 불러오고 있습니다.'}
            </p>
          </div>

          {/* 피드 리스트 영역: 순수 리스트형 카드 구조 */}
          <div className={styles.feedContainer}>
            <div className={styles.feedScrollArea}>
              {isLoading ? (
                <div className={styles.emptyFeedCard}>
                  <p>로딩 중...</p>
                </div>
              ) : posts.length === 0 ? (
                <div className={styles.emptyFeedCard}>
                  <p>아직 작성한 게시글이 없습니다. 첫 글을 남겨보세요!</p>
                </div>
              ) : (
                posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    currentUser={currentUser}
                    onRefresh={fetchData}
                  />
                ))
              )}
            </div>
          </div>
        </section>
      </div>

      <AlertModal
        isOpen={modal.isOpen}
        title={modal.title}
        message={modal.message}
        onConfirm={modal.onConfirm}
      />
    </main>
  );
}
