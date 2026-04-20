'use client';

import ActionList from 'app/components/ActionList';
import { DefaultButton } from 'app/components/Button';
import SkeletonImage from 'app/components/loaders/SkeletonImage';
import PostCard from 'app/components/PostCard';
import TextArea from 'app/components/TextArea';
import layoutStyles from 'app/Layout.module.css';
import AlertModal from 'app/modals/AlertModal';
import { useTransitionNav } from 'app/providers/TransitionProvider';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';
import { getUserDisplayName } from 'src/userHelpers';
import { logger } from 'src/utils/log';
import styles from './sns.module.css';

export default function SNSPage() {
  const router = useRouter();
  const { transitionTo, setPageReady } = useTransitionNav();
  const [user, setUser] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasFetched, setHasFetched] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const fetchPosts = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await axios.get('/api/sns/posts');
      setPosts(response.data.posts);
    } catch (error) {
      logger.e(`Fetch posts error: ${error}`);
      showAlert('게시글을 불러올 수 없습니다.');
    } finally {
      setIsLoading(false);
      setHasFetched(true);
    }
  }, []);

  // 최초 진입 시 1회만 연필 로더 대기 명령
  useEffect(() => {
    setPageReady(false);
  }, [setPageReady]);

  // 데이터 무결성 검증: 유저 정보와 포스트 데이터가 모두 준비되었을 때만 연필 로더 해제
  useEffect(() => {
    if (user && hasFetched) {
      setPageReady(true);
    }
  }, [user, hasFetched, setPageReady]);

  useEffect(() => {
    if (!user && typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user_info');
      if (!storedUser) {
        router.push('/login');
        return;
      }
      setUser(JSON.parse(storedUser));
    }
    fetchPosts();
  }, [fetchPosts, router]);

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('auth_token');
      await axios.post('/api/sns/posts', {
        content: newPostContent
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewPostContent('');
      fetchPosts();
    } catch (error) {
      logger.e(`Post error: ${error}`);
      showAlert('게시글 등록 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const menuItems = [
    { label: '전체 피드', onClick: () => fetchPosts() },
    { label: '내 프로필 수정', onClick: () => transitionTo('/dashboard/profile') },
  ];

  return (
    <main className={layoutStyles.container}>
      <div className={styles.layoutContainer}>
        {/* 왼쪽 사이드바: 프로필 및 메뉴 통합 카드 (메일함 구조 차용) */}
        <aside className={`${layoutStyles.formCard} ${styles.sidebar}`}>
          <div className={styles.sidebarProfileSection}>
            <SkeletonImage
              src={user?.profileImage || '/app/logo-square-256.png'}
              alt="My Profile"
              width={100}
              height={100}
              className={`${styles.miniProfileImage} ${styles.clickable}`}
              onClick={() => user && transitionTo(`/dashboard/sns/user/${user.userId}`)}
            />
            <div className={styles.miniProfileInfo}>
              {user ? (
                <>
                  <span
                    className={`${styles.miniNickname} ${styles.clickable}`}
                    onClick={() => transitionTo(`/dashboard/sns/user/${user.userId}`)}
                  >
                    {getUserDisplayName(user)}
                  </span>
                  <span className={styles.miniBio}>{user.bio || '자기소개가 없습니다.'}</span>
                </>
              ) : (
                <>
                  <span className={styles.miniNickname} style={{ opacity: 0.3 }}>정보 로딩 중...</span>
                  <span className={styles.miniBio} style={{ opacity: 0.3 }}>잠시만 기다려주세요.</span>
                </>
              )}
            </div>
          </div>

          <div className={styles.navSection}>
            <ActionList items={menuItems} />
          </div>

          <div className={styles.sidebarFooter}>
            <DefaultButton
              text="대쉬보드 돌아가기"
              onClick={() => transitionTo('/dashboard')}
              variant="none"
              width="fill"
            />
          </div>
        </aside>

        {/* 오른쪽 메인 컨텐츠: 피드 */}
        <section className={styles.contentArea}>
          {/* 게시글 작성 섹션: 2단 레이아웃(좌: 프로필, 우: 입력필드) 적용 */}
          <div className={styles.postForm}>
            {user && (
              <div className={styles.postLeft}>
                <SkeletonImage
                  src={user.profileImage || '/app/logo-square-256.png'}
                  alt="My Profile"
                  width={48}
                  height={48}
                  className={styles.profileImage}
                />
              </div>
            )}
            <div className={styles.postFormRight}>
              <form onSubmit={handlePostSubmit} className={styles.flexColumnGap}>
                <TextArea
                  placeholder="무슨 생각을 하고 계신가요?"
                  value={newPostContent}
                  onChange={setNewPostContent}
                  disabled={isSubmitting}
                  rows={3}
                />
                <div className={styles.flexEnd}>
                  <DefaultButton
                    text="게시하기"
                    type="submit"
                    variant="primary"
                    width="hug"
                    isLoading={isSubmitting}
                    disabled={isSubmitting || !newPostContent.trim()}
                  />
                </div>
              </form>
            </div>
          </div>

          {/* 피드 영역: 데이터가 준비되면 즉시 노출 (연필 로더가 가려줌) */}
          <div className={styles.feedContainer}>
            <div
              style={{
                maxHeight: 800,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column'
              }}
              className={styles.feedScrollArea}
            >
              {hasFetched && (
                <div style={{ width: '100%' }}>
                  {posts.length > 0 ? (
                    posts.map((post) => (
                      <PostCard
                        key={post.id}
                        post={post}
                        currentUser={user}
                        onRefresh={fetchPosts}
                      />
                    ))
                  ) : (
                    <div className={styles.emptyFeedCard}>
                      <p className={layoutStyles.dataTextMuted}>아직 게시글이 없습니다. 첫 글을 남겨보세요!</p>
                    </div>
                  )}
                </div>
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
