'use client';

import layoutStyles from 'app/Layout.module.css';
import { DefaultButton, FieldButton } from 'app/components/Button';
import PostCard from 'app/components/PostCard';
import TextInput from 'app/components/TextInput';
import styles from 'app/dashboard/sns/sns.module.css';
import Tooltip from 'app/overlays/Tooltip';
import axios from 'axios';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';
import { formatFullDate, formatRelativeTime } from 'src/utils/date';

export default function PostDetailPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id;

  const [user, setUser] = useState<any>(null);
  const [post, setPost] = useState<any>(null);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const response = await axios.get(`/api/sns/posts/${postId}`);
      setPost(response.data.post);
    } catch (error) {
      console.error('Fetch post detail error:', error);
      alert('게시글을 불러올 수 없습니다.');
      router.push('/dashboard/sns');
    } finally {
      setIsLoading(false);
    }
  }, [postId, router]);

  useEffect(() => {
    const storedUser = localStorage.getItem('user_info');
    if (!storedUser) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(storedUser));
    fetchData();
  }, [fetchData, router]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const trimmedComment = newComment.trim();
      const token = localStorage.getItem('auth_token');
      await axios.post('/api/sns/comments', {
        postId: Number(postId),
        content: trimmedComment
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewComment('');
      fetchData();
    } catch (error) {
      console.error('Comment error:', error);
      alert('댓글 등록 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !user || !post) {
    return (
      <main className={layoutStyles.container}>
        <p>로딩 중...</p>
      </main>
    );
  }

  return (
    <main className={layoutStyles.container}>
      <div className={styles.layoutContainer}>
        {/* 왼쪽 사이드바: 액션 중심의 간소화된 카드 */}
        <aside className={`${layoutStyles.formCard} ${styles.sidebar}`}>
          <div className={styles.sidebarFooter}>
            <DefaultButton
              text="작성자 프로필 보기"
              onClick={() => router.push(`/dashboard/sns/user/${post.authorId}`)}
              variant="primary"
              width="fill"
            />
            <DefaultButton
              text="돌아가기"
              onClick={() => router.push('/dashboard/sns')}
              variant="none"
              width="fill"
            />
          </div>
        </aside>

        {/* 오른쪽 메인 컨텐츠: 게시글 상세 및 댓글 목록 */}
        <section className={styles.contentArea}>
          <PostCard
            post={post}
            currentUser={user}
            onRefresh={fetchData}
            isDetail={true}
            isListItem={false}
          />

          {/* 댓글 영역: 게시글 카드와 동일한 너비의 독립 카드 */}
          <div className={styles.commentAreaCard}>
            {/* 댓글 입력 섹션 */}
            <div className={styles.commentInputSection}>
              <h5 className={styles.commentHeaderTitle}>댓글 {post.comments?.length || 0}</h5>
              <form onSubmit={handleCommentSubmit} className={styles.commentInputGroup}>
                <div style={{ flex: 1 }}>
                  <TextInput
                    placeholder="따뜻한 댓글로 응원해주세요."
                    value={newComment}
                    onChange={setNewComment}
                    disabled={isSubmitting}
                  />
                </div>
                <FieldButton
                  text={isSubmitting ? '...' : '작성'}
                  type="submit"
                  disabled={isSubmitting || !newComment.trim()}
                />
              </form>
            </div>

            {/* 댓글 목록 섹션 */}
            <div className={styles.commentList}>
              {post.comments && post.comments.length > 0 ? (
                post.comments.map((comment: any) => (
                  <div key={comment.id} className={styles.commentItem}>
                    <Image
                      src={comment.author.profileImage || '/app/logo-square-256.png'}
                      alt="Commenter"
                      width={40}
                      height={40}
                      className={styles.commentProfileImage}
                    />
                    <div className={styles.commentBody}>
                      <div className={styles.postHeader}>
                        <div className={styles.authorInfo}>
                          <span className={styles.nickname}>
                            {comment.author.nickname || comment.author.userId || '무명'}
                          </span>
                          <div className={styles.postMeta}>
                            <Tooltip content={formatFullDate(new Date(comment.createdAt))}>
                              <span>{formatRelativeTime(new Date(comment.createdAt))}</span>
                            </Tooltip>
                          </div>
                        </div>
                      </div>
                      <div className={styles.commentText}>{comment.content}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className={layoutStyles.dataTextMuted} style={{ textAlign: 'center', padding: '20px 0' }}>
                  아직 댓글이 없습니다. 첫 댓글을 남겨보세요!
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
