'use client';

import ActionList from 'app/components/ActionList';
import { DefaultButton } from 'app/components/Button';
import PostCard from 'app/components/PostCard';
import TextArea from 'app/components/TextArea';
import layoutStyles from 'app/Layout.module.css';
import axios from 'axios';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';
import styles from './sns.module.css';

export default function SNSPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 데이터 불러오기
  const fetchPosts = useCallback(async () => {
    try {
      const response = await axios.get('/api/sns/posts');
      setPosts(response.data.posts);
    } catch (error) {
      console.error('Fetch posts error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem('user_info');
    if (!storedUser) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(storedUser));
    fetchPosts();
  }, [router, fetchPosts]);

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    setIsSubmitting(true);
    try {
      const trimmedContent = newPostContent.trim();
      const token = localStorage.getItem('auth_token');
      await axios.post('/api/sns/posts', {
        content: trimmedContent
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewPostContent('');
      fetchPosts();
    } catch (error) {
      console.error('Create post error:', error);
      alert('게시글 등록 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const menuItems = [
    { label: '전체 피드', onClick: () => fetchPosts() },
    { label: '내 프로필 수정', onClick: () => router.push('/dashboard/profile') },
  ];

  if (isLoading || !user) {
    return (
      <main className={layoutStyles.container}>
        <p>로딩 중...</p>
      </main>
    );
  }

  return (
    <main className={layoutStyles.container}>
      <div className={styles.layoutContainer}>
        {/* 왼쪽 사이드바: 프로필 및 메뉴 통합 카드 (메일함 구조 차용) */}
        <aside className={`${layoutStyles.formCard} ${styles.sidebar}`}>
          <div className={styles.sidebarProfileSection}>
            <Image
              src={user.profileImage || '/app/logo-square-256.png'}
              alt="My Profile"
              width={100}
              height={100}
              className={styles.miniProfileImage}
            />
            <div className={styles.miniProfileInfo}>
              <span className={styles.miniNickname}>{user.nickname || user.name || '무명'}</span>
              <span className={styles.miniBio}>{user.bio || '자기소개가 없습니다.'}</span>
              <div className={styles.pointsBadge}>
                {user.points?.toLocaleString() || 0} P
              </div>
            </div>
          </div>

          <div className={styles.navSection}>
            <ActionList items={menuItems} />
          </div>

          <div className={styles.sidebarFooter}>
            <DefaultButton
              text="대쉬보드 돌아가기"
              onClick={() => router.push('/dashboard')}
              variant="none"
              width="fill"
            />
          </div>
        </aside>

        {/* 오른쪽 메인 컨텐츠: 피드 */}
        <section className={styles.contentArea}>
          {/* 게시글 작성 섹션: 2단 레이아웃(좌: 프로필, 우: 입력필드) 적용 */}
          <div className={styles.postForm}>
            <div className={styles.postLeft}>
              <Image
                src={user.profileImage || '/app/logo-square-256.png'}
                alt="My Profile"
                width={48}
                height={48}
                className={styles.profileImage}
              />
            </div>
            <div className={styles.postFormRight}>
              <form onSubmit={handlePostSubmit} className={styles.flexColumnGap}>
                <TextArea
                  placeholder="오늘의 생각이나 기록을 예쁘게 남겨보세요."
                  value={newPostContent}
                  onChange={setNewPostContent}
                  disabled={isSubmitting}
                  rows={3}
                />
                <div className={styles.flexEnd}>
                  <DefaultButton
                    text={isSubmitting ? '등록 중...' : '게시하기'}
                    type="submit"
                    variant="primary"
                    width="hug"
                    disabled={isSubmitting || !newPostContent.trim()}
                  />
                </div>
              </form>
            </div>
          </div>

          {/* 피드 리스트 영역: 순수 리스트형 카드 구조 */}
          <div className={styles.feedContainer}>
            <div className={styles.feedScrollArea}>
              {posts.length === 0 ? (
                <div className={styles.emptyFeedCard}>
                  <p>아직 게시글이 없습니다. 첫 글을 남겨보세요!</p>
                </div>
              ) : (
                posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    currentUser={user}
                    onRefresh={fetchPosts}
                  />
                ))
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
