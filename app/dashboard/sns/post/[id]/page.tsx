'use client';

import layoutStyles from 'app/Layout.module.css';
import { DefaultButton, FieldButton } from 'app/components/Button';
import PostCard from 'app/components/PostCard';
import TextInput from 'app/components/TextInput';
import SkeletonImage from 'app/components/loaders/SkeletonImage';
import styles from 'app/dashboard/sns/sns.module.css';
import AlertModal from 'app/modals/AlertModal';
import Tooltip from 'app/overlays/Tooltip';
import { useTransitionNav } from 'app/providers/TransitionProvider';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';
import { getUserDisplayName } from 'src/userHelpers';
import { formatFullDate, formatRelativeTime } from 'src/utils/date';
import { logger } from 'src/utils/log';
import { formatCompactNumber } from 'src/utils/str';

export default function PostDetailPage() {
  const router = useRouter();
  const { transitionTo, setPageReady } = useTransitionNav();
  const params = useParams();
  const postId = params.id;

  const [user, setUser] = useState<any>(null);
  const [post, setPost] = useState<any>(null);
  const [newComment, setNewComment] = useState('');
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

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`/api/sns/posts/${postId}`);
      setPost(response.data.post);
    } catch (error) {
      logger.e(`Fetch post detail error: ${error}`);
      showAlert('게시글을 불러올 수 없습니다.', () => {
        router.push('/dashboard/sns');
      });
    } finally {
      setIsLoading(false);
      setHasFetched(true);
    }
  }, [postId, router]);

  // 최초 진입 시 1회만 연필 로더 대기 명령
  useEffect(() => {
    setPageReady(false);
  }, [setPageReady]);

  // 데이터 무결성 검증: 게시글 데이터가 준비되었을 때만 연필 로더 해제
  useEffect(() => {
    if (post && hasFetched) {
      setPageReady(true);
    }
  }, [post, hasFetched, setPageReady]);

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
      logger.e(`Comment error: ${error}`);
      showAlert('댓글 등록 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <main className={layoutStyles.container}>
      <div className={styles.layoutContainer}>
        {/* 왼쪽 사이드바: 액션 중심의 간소화된 카드 */}
        <aside className={`${layoutStyles.formCard} ${styles.sidebar}`}>
          <div className={styles.sidebarFooter}>
            <DefaultButton
              text="돌아가기"
              onClick={() => transitionTo('/dashboard/sns')}
              variant="none"
              width="fill"
            />
          </div>
        </aside>

        {/* 오른쪽 메인 컨텐츠: 게시글 상세 및 댓글 목록 */}
        <section className={styles.contentArea}>
          {post ? (
            <PostCard
              post={post}
              currentUser={user}
              onRefresh={fetchData}
              isDetail={true}
              isListItem={false}
            />
          ) : (
            <div style={{ minHeight: '200px' }}>
              {/* 데이터 로딩 전 빈 공간 유지 */}
            </div>
          )}

          {/* 댓글 영역: 게시글 카드와 동일한 너비의 독립 카드 */}
          <div className={styles.commentAreaCard}>
            {/* 댓글 입력 섹션: 항상 노출 */}
            <div className={styles.commentInputSection}>
              <h5 className={styles.commentHeaderTitle}>
                댓글 {post ? formatCompactNumber(post.comments?.length || 0) : ''}
              </h5>
              <form onSubmit={handleCommentSubmit} className={styles.commentInputGroup}>
                <div style={{ flex: 1 }}>
                  <TextInput
                    placeholder="따뜻한 댓글로 응원해주세요."
                    value={newComment}
                    onChange={setNewComment}
                    disabled={isSubmitting || !post}
                  />
                </div>
                <FieldButton
                  text="작성"
                  type="submit"
                  isLoading={isSubmitting}
                  disabled={isSubmitting || !newComment.trim() || !post}
                />
              </form>
            </div>

            {/* 댓글 목록 섹션 */}
            <div className={styles.commentList}>
              {post?.comments && post.comments.length > 0 ? (
                post.comments.map((comment: any) => (
                  <div key={comment.id} className={styles.commentItem}>
                    <SkeletonImage
                      src={comment.author.profileImage || '/app/logo-square-256.png'}
                      alt="Commenter"
                      width={40}
                      height={40}
                      className={`${styles.commentProfileImage} ${styles.clickable}`}
                      onClick={() => transitionTo(`/dashboard/sns/user/${comment.authorId}`)}
                    />
                    <div className={styles.commentBody}>
                      <div className={styles.postHeader}>
                        <div className={styles.authorInfo}>
                          <span
                            className={`${styles.nickname} ${styles.clickable}`}
                            onClick={() => transitionTo(`/dashboard/sns/user/${comment.authorId}`)}
                          >
                            {getUserDisplayName(comment.author)}
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
              ) : post ? (
                <div className={layoutStyles.dataTextMuted} style={{ textAlign: 'center', padding: '20px 0' }}>
                  아직 댓글이 없습니다. 첫 댓글을 남겨보세요!
                </div>
              ) : null}
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
