'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import layoutStyles from 'app/Layout.module.css';
import styles from 'app/dashboard/sns/sns.module.css';
import { DefaultButton } from 'app/components/Button';
import PostCard from 'app/components/PostCard';
import axios from 'axios';
import { FaChevronLeft } from 'react-icons/fa6';

export default function UserProfilePage() {
  const router = useRouter();
  const params = useParams();
  const targetUserId = params.userId;

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const response = await axios.get(`/api/sns/users/${targetUserId}`);
      setProfile(response.data.profile);
      setPosts(response.data.posts);
    } catch (error) {
      console.error('Fetch user profile error:', error);
      alert('사용자 정보를 불러올 수 없습니다.');
      router.push('/dashboard/sns');
    } finally {
      setIsLoading(false);
    }
  }, [targetUserId, router]);

  useEffect(() => {
    const storedUser = localStorage.getItem('user_info');
    if (!storedUser) {
      router.push('/login');
      return;
    }
    setCurrentUser(JSON.parse(storedUser));
    fetchData();
  }, [fetchData, router]);

  if (isLoading || !currentUser || !profile) {
    return (
      <main className={layoutStyles.container}>
        <div className={layoutStyles.formCard}>
          <p>로딩 중...</p>
        </div>
      </main>
    );
  }

  return (
    <main className={layoutStyles.container}>
      <div className={styles.layoutContainer}>
        {/* 왼쪽 사이드바: 타인 프로필 정보 카드 (메일함 구조 차용) */}
        <aside className={`${layoutStyles.formCard} ${styles.sidebar}`}>
          <div className={styles.sidebarProfileSection}>
            <Image
              src={profile.profileImage || '/app/logo-square-256.png'}
              alt="Profile"
              width={100}
              height={100}
              className={styles.miniProfileImage}
            />
            <div className={styles.miniProfileInfo}>
              <span className={styles.miniNickname}>{profile.nickname || '무명'}</span>
              <span className={styles.miniBio}>{profile.bio || '자기소개가 없습니다.'}</span>
            </div>
          </div>

          <div className={styles.sidebarFooter}>
            <DefaultButton
              text="돌아가기"
              onClick={() => router.push('/dashboard/sns')}
              variant="none"
              width="fill"
            />
          </div>
        </aside>

        {/* 오른쪽 메인 컨텐츠: 해당 사용자의 게시글 목록 */}
        <section className={styles.contentArea}>
          <div className={`${layoutStyles.formCard} ${styles.contentCard}`}>
            <h4 className={`${layoutStyles.title} ${styles.titleSmallMargin}`}>
              {profile.nickname || '무명'} 님의 활동
            </h4>
            <p className={layoutStyles.subtitle}>
              총 {posts.length}개의 글을 남겼습니다.
            </p>
          </div>

          {/* 피드 리스트 영역: 순수 리스트형 카드 구조 */}
          <div className={styles.feedContainer}>
            <div className={styles.feedScrollArea}>
              {posts.length === 0 ? (
                <div className={styles.emptyFeedCard}>
                  <p>아직 작성한 게시글이 없습니다.</p>
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
    </main>
  );
}
