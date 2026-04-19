'use client';

import styles from 'app/dashboard/sns/sns.module.css';
import AlertModal from 'app/modals/AlertModal';
import ConfirmModal from 'app/modals/ConfirmModal';
import Tooltip from 'app/overlays/Tooltip';
import axios from 'axios';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';
import { FaComment, FaHeart, FaRegHeart, FaTrash } from 'react-icons/fa6';
import { formatFullDate, formatRelativeTime } from 'src/utils/date';
import { logger } from 'src/utils/log';
import { getUserDisplayName } from 'src/userHelpers';

interface PostCardProps {
  post: any;
  currentUser: any;
  onRefresh: () => void;
  isDetail?: boolean
  isListItem?: boolean;
}

export default function PostCard({ post, currentUser, onRefresh, isDetail = false, isListItem = true }: PostCardProps) {
  const router = useRouter();

  const contentRef = useRef<HTMLDivElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  // 모달 상태
  const [modal, setModal] = useState({
    isOpen: false,
    title: '알림',
    message: '',
    onConfirm: () => setModal(prev => ({ ...prev, isOpen: false }))
  });

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '확인',
    message: '',
    onConfirm: () => { },
    onCancel: () => setConfirmModal(prev => ({ ...prev, isOpen: false }))
  });

  const showAlert = (message: string, title: string = '알림') => {
    setModal({
      isOpen: true,
      title,
      message,
      onConfirm: () => setModal(prev => ({ ...prev, isOpen: false }))
    });
  };

  const showConfirm = (message: string, onConfirm: () => void, title: string = '확인') => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      },
      onCancel: () => setConfirmModal(prev => ({ ...prev, isOpen: false }))
    });
  };

  const isLiked = post.likes?.some((like: any) => like.userId === currentUser.userId);
  const isOwner = post.authorId === currentUser.userId || currentUser.role === 'ADMIN';

  const postDate = new Date(post.createdAt);
  const relativeTime = formatRelativeTime(postDate);
  const fullDate = formatFullDate(postDate);

  useEffect(() => {
    // 리스트 모드일 때만 높이 체크
    if (!isDetail && contentRef.current) {
      const { scrollHeight, clientHeight } = contentRef.current;
      setIsOverflowing(scrollHeight > clientHeight);
    }
  }, [isDetail, post.content]);
  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem('auth_token');
      await axios.post('/api/sns/likes', { postId: post.id }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onRefresh();
    } catch (error) {
      logger.e(`Like error: ${error}`);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    showConfirm('정말로 이 게시글을 삭제하시겠습니까?', async () => {
      try {
        const token = localStorage.getItem('auth_token');
        await axios.delete(`/api/sns/posts/${post.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (isDetail) {
          router.push('/dashboard/sns');
        } else {
          onRefresh();
        }
      } catch (error) {
        logger.e(`Delete error: ${error}`);
        showAlert('게시글 삭제 중 오류가 발생했습니다.');
      }
    });
  };

  const goToDetail = () => {
    if (!isDetail) {
      router.push(`/dashboard/sns/post/${post.id}`);
    }
  };

  const goToProfile = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/dashboard/sns/user/${post.authorId}`);
  };

  const cardClassName = isListItem
    ? styles.postListItem
    : `${styles.postCard} ${isDetail ? styles.postCardDefault : styles.postCardClickable}`;

  return (
    <div
      className={cardClassName}
      onClick={goToDetail}
    >
      {/* 1. 왼쪽: 프로필 영역 */}
      <div className={styles.postLeft}>
        <Image
          src={post.author.profileImage || '/app/logo-square-256.png'}
          alt="Profile"
          width={48}
          height={48}
          className={styles.profileImage}
          onClick={goToProfile}
        />
      </div>

      {/* 2. 오른쪽: 콘텐츠 영역 */}
      <div className={styles.postRight}>
        <div className={styles.postHeader}>
          <div className={styles.authorInfo}>
            <span className={styles.nickname} onClick={goToProfile}>
              {getUserDisplayName(post.author)}
            </span>
            <div className={styles.postMeta}>
              <Tooltip content={fullDate}>
                <span>{relativeTime}</span>
              </Tooltip>
            </div>
          </div>

          {isOwner && (
            <button className={styles.deleteButton} onClick={handleDelete} title="삭제">
              <FaTrash />
            </button>
          )}
        </div>

        <div
          ref={contentRef}
          className={`${styles.postContent} ${!isDetail ? styles.postContentCollapsed : ''}`}
        >
          {post.content}
          {!isDetail && isOverflowing && (
            <div className={styles.readMoreOverlay}>
              <span className={styles.readMoreText}>자세히 보기</span>
            </div>
          )}
        </div>

        <div className={styles.postFooter}>
          <button
            className={`${styles.actionButton} ${isLiked ? styles.actionButtonActive : ''}`}
            onClick={handleLike}
          >
            {isLiked ? <FaHeart /> : <FaRegHeart />}
            <span>{post._count?.likes || 0}</span>
          </button>
          <button className={styles.actionButton}>
            <FaComment />
            <span>{post._count?.comments || 0}</span>
          </button>
        </div>
      </div>

      <AlertModal
        isOpen={modal.isOpen}
        title={modal.title}
        message={modal.message}
        onConfirm={modal.onConfirm}
      />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={confirmModal.onCancel}
        variant="danger"
      />
    </div>
  );
}
