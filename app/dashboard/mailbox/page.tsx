'use client';

import ActionList from 'app/components/ActionList';
import { DefaultButton, FieldButton } from 'app/components/Button';
import SelectInput from 'app/components/SelectInput';
import TextArea from 'app/components/TextArea';
import TextInput from 'app/components/TextInput';
import layoutStyles from 'app/Layout.module.css';
import AlertModal from 'app/modals/AlertModal';
import ConfirmModal from 'app/modals/ConfirmModal';
import { useTransitionNav } from 'app/providers/TransitionProvider';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FaAsterisk } from 'react-icons/fa';
import { IoAlertCircleOutline } from 'react-icons/io5';
import { logger } from 'src/utils/log';
import styles from './mailbox.module.css';

type MailView = 'inbox' | 'sent' | 'compose' | 'view';

export default function MailboxPage() {
  const router = useRouter();
  const { transitionTo } = useTransitionNav();
  const [currentView, setCurrentView] = useState<MailView>('inbox');
  const [userEmail, setUserEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [userName, setUserName] = useState('');

  // 폼 상태
  const [receiverEmail, setReceiverEmail] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSentSuccess, setIsSentSuccess] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // 알림 모달 상태
  const [alertModal, setAlertModal] = useState({
    isOpen: false,
    title: '알림',
    message: '',
    onConfirm: () => setAlertModal(prev => ({ ...prev, isOpen: false }))
  });

  const showAlert = (message: string, title: string = '알림') => {
    setAlertModal({
      isOpen: true,
      title,
      message,
      onConfirm: () => setAlertModal(prev => ({ ...prev, isOpen: false }))
    });
  };

  // 리스트 상태
  const [mails, setMails] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMail, setSelectedMail] = useState<any | null>(null);
  const [errorStatus, setErrorStatus] = useState<{ field: string; message: string } | null>(null);

  // 툴바 및 필터 상태
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [inboxCount, setInboxCount] = useState(0);
  const [sentCount, setSentCount] = useState(0);

  const formatCount = (count: number) => {
    return count >= 1000 ? '999+' : count.toString();
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user_info');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserId(user.userId);
      setUserEmail(user.email || `${user.userId}@bono.com`);
      setUserName(user.name || user.userId);
    } else {
      router.push('/login');
    }
  }, [router]);

  // 메일 개수(Count) 가져오기
  const fetchCounts = async () => {
    if (!userId) return;
    try {
      const [inboxRes, sentRes] = await Promise.all([
        fetch(`/api/mailbox/inbox?userId=${userId}`),
        fetch(`/api/mailbox/sent?userId=${userId}`)
      ]);
      const [inboxData, sentData] = await Promise.all([inboxRes.json(), sentRes.json()]);

      if (inboxRes.ok) setInboxCount(inboxData.inbox.length);
      if (sentRes.ok) setSentCount(sentData.sent.length);
    } catch (e) {
      logger.e(`Failed to fetch counts: ${e}`);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchCounts();
    }
  }, [userId]);

  // 메일 목록 가져오기 함수
  const fetchMails = async (view: MailView) => {
    if (view !== 'inbox' && view !== 'sent') return;

    setIsLoading(true);
    try {
      const endpoint = `/api/mailbox/${view}?userId=${userId}`;
      const response = await fetch(endpoint);
      const data = await response.json();

      if (response.ok) {
        setMails(view === 'inbox' ? data.inbox : data.sent);
      }
    } catch (error) {
      logger.e(`Failed to fetch mails: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId && (currentView === 'inbox' || currentView === 'sent')) {
      fetchMails(currentView);
      setSelectedMail(null); // 뷰 전환 시 선택된 메일 초기화
      fetchCounts(); // 뷰 전환시마다도 최신화
    }
  }, [userId, currentView]);

  const handleSelectMail = async (mail: any) => {
    setSelectedMail(mail);
    setCurrentView('view');

    // 읽지 않은 받은 메일인 경우 읽음 처리
    if (currentView === 'inbox' && !mail.isRead) {
      try {
        await fetch('/api/mailbox/read', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mailId: mail.id }),
        });

        // 로컬 상태 업데이트
        setMails(prev => prev.map(m =>
          m.id === mail.id ? { ...m, isRead: true } : m
        ));
      } catch (e) {
        logger.e(`Failed to mark as read: ${e}`);
      }
    }
  };

  const handleSendMail = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorStatus(null);

    if (!receiverEmail) {
      setErrorStatus({ field: 'receiverEmail', message: '받는 사람의 이메일 주소를 입력해주세요.' });
      return;
    }
    if (!title) {
      setErrorStatus({ field: 'title', message: '메일 제목을 입력해주세요.' });
      return;
    }
    if (!content) {
      setErrorStatus({ field: 'content', message: '메일 내용을 입력해주세요.' });
      return;
    }

    setIsSending(true);
    try {
      const response = await fetch('/api/mailbox/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senderId: userId, receiverEmail, title, content }),
      });

      if (response.ok) {
        setIsSentSuccess(true);
        setReceiverEmail('');
        setTitle('');
        setContent('');
        setErrorStatus(null);
      } else {
        const data = await response.json();
        const field = data.field || 'receiverEmail';
        setErrorStatus({ field, message: data.message || '메일 발송에 실패했습니다.' });
      }
    } catch (error) {
      showAlert('서버 통신 중 오류가 발생했습니다.');
    } finally {
      setIsSending(false);
    }
  };

  const navItems = [
    {
      label: (
        <span>
          받은메일함 <span style={{ color: 'var(--text-muted)', marginLeft: '2px', fontSize: '13px' }}>({formatCount(inboxCount)})</span>
        </span>
      ),
      onClick: () => {
        setCurrentView('inbox');
        setIsSentSuccess(false);
        setSelectedMail(null);
        setSelectedIds([]);
        setSearchQuery('');
        setErrorStatus(null);
      }
    },
    {
      label: (
        <span>
          보낸메일함 <span style={{ color: 'var(--text-muted)', marginLeft: '2px', fontSize: '13px' }}>({formatCount(sentCount)})</span>
        </span>
      ),
      onClick: () => {
        setCurrentView('sent');
        setIsSentSuccess(false);
        setSelectedMail(null);
        setSelectedIds([]);
        setSearchQuery('');
        setErrorStatus(null);
      }
    }
  ];

  const filteredMails = mails
    .filter(mail => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      const targetName = currentView === 'inbox'
        ? (mail.sender?.name || mail.senderId)
        : (mail.receiver?.name || mail.receiverId);
      return (
        mail.title.toLowerCase().includes(q) ||
        mail.content.toLowerCase().includes(q) ||
        targetName?.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

  const handleToggleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredMails.map(m => m.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleDeleteSelected = () => {
    setIsDeleteModalOpen(true);
  };

  const executeBulkDelete = async () => {
    setIsDeleteModalOpen(false);
    try {
      const res = await fetch('/api/mailbox/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mailIds: selectedIds, userId }),
      });

      if (res.ok) {
        // UI 로컬 업데이트
        setMails(prev => {
          const newList = prev.filter(m => !selectedIds.includes(m.id));
          if (currentView === 'inbox') setInboxCount(newList.length);
          else setSentCount(newList.length);
          return newList;
        });
        setSelectedIds([]);
      } else {
        const data = await res.json();
        showAlert(data.message || '삭제 중 오류가 발생했습니다.');
      }
    } catch (e) {
      logger.e(`Bulk delete error: ${e}`);
      showAlert('서버 요청 중 오류가 발생했습니다.');
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <main className={layoutStyles.container}>
      <div className={styles.mailboxContainer}>

        {/* 왼쪽 사이드바 */}
        <aside className={`${layoutStyles.formCard} ${styles.sidebar}`}>
          <div className={styles.actionButtonGroup}>
            <DefaultButton
              text="메일 작성하기"
              onClick={() => {
                setCurrentView('compose');
                setIsSentSuccess(false);
                setErrorStatus(null);
              }}
              variant="primary"
            />
          </div>

          <div className={styles.navSection}>
            <ActionList items={navItems} />
          </div>

          <div style={{ marginTop: '32px' }}>
            <DefaultButton
              text="대쉬보드로 돌아가기"
              onClick={() => transitionTo('/dashboard')}
              variant="none"
              width="fill"
            />
          </div>
        </aside>

        {/* 오른쪽 컨텐츠 영역 */}
        <section className={`${layoutStyles.formCard} ${styles.contentArea}`}>
          <div className={styles.contentHeader}>
            <h3 className={styles.viewTitle}>
              {currentView === 'inbox' && '받은메일함'}
              {currentView === 'sent' && '보낸메일함'}
              {currentView === 'compose' && ''}
              {currentView === 'view' && (selectedMail?.title || '메일 읽기')}
            </h3>
          </div>

          <div className={styles.mainContent}>
            {(currentView === 'inbox' || currentView === 'sent') && (
              <>
                {isLoading ? (
                  <div className={styles.emptyState}><p>로딩 중...</p></div>
                ) : mails.length > 0 ? (
                  <>
                    <div className={styles.toolbar}>
                      <div className={styles.colCheckbox}>
                        <input
                          type="checkbox"
                          className={styles.checkbox}
                          checked={filteredMails.length > 0 && selectedIds.length === filteredMails.length}
                          onChange={handleToggleSelectAll}
                        />
                      </div>
                      <div className={styles.toolbarActions}>
                        {selectedIds.length > 0 ? (
                          <div style={{ marginLeft: 'auto' }}>
                            <FieldButton text="선택한 메일 삭제하기" type="button" onClick={handleDeleteSelected} />
                          </div>
                        ) : (
                          <div className={styles.filterGroup}>
                            <div style={{ width: '120px' }}>
                              <SelectInput
                                value={sortOrder}
                                onChange={(val: string) => setSortOrder(val as 'desc' | 'asc')}
                                options={[
                                  { value: 'desc', label: '최신순' },
                                  { value: 'asc', label: '오래된순' }
                                ]}
                              />
                            </div>
                            <div style={{ width: '200px' }}>
                              <TextInput
                                type="search"
                                value={searchQuery}
                                onChange={setSearchQuery}
                                placeholder="검색어를 입력하세요"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className={layoutStyles.dataList}>
                      {filteredMails.map((mail) => (
                        <div
                          key={mail.id}
                          className={`${layoutStyles.dataItem} ${currentView === 'inbox' && !mail.isRead ? styles.mailListItemUnread : ''}`}
                          onClick={() => handleSelectMail(mail)}
                        >
                          <div className={`${layoutStyles.dataCol} ${layoutStyles.dataColFixed} ${styles.colCheckbox}`} onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              className={styles.checkbox}
                              checked={selectedIds.includes(mail.id)}
                              onChange={(e) => {
                                if (e.target.checked) setSelectedIds(p => [...p, mail.id]);
                                else setSelectedIds(p => p.filter(id => id !== mail.id));
                              }}
                            />
                          </div>
                          <div className={`${layoutStyles.dataCol} ${layoutStyles.dataColFixed} ${styles.colName} ${layoutStyles.dataTextLabel}`}>
                            {currentView === 'inbox' ? mail.sender?.name || mail.senderId : mail.receiver?.name || mail.receiverId}
                          </div>
                          <div className={`${layoutStyles.dataCol} ${layoutStyles.dataColGrow} ${styles.colTitleContent}`}>
                            <span className={`${styles.listMailTitle} ${layoutStyles.dataTextLabel}`}>{mail.title}</span>
                          </div>
                          <div className={`${layoutStyles.dataCol} ${layoutStyles.dataColFixed} ${styles.colDate} ${layoutStyles.dataTextMuted}`}>
                            {formatDate(mail.createdAt)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className={styles.emptyState}>
                    <p>표시할 메일이 없습니다.</p>
                  </div>
                )}
              </>
            )}

            {currentView === 'view' && selectedMail && (
              <div className={styles.viewContainer}>
                <div className={styles.viewHeader}>
                  <div className={styles.mailInfoGrid}>
                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>받는 사람:</span>
                      <span className={styles.infoValue}>
                        {selectedMail.receiver?.email || selectedMail.receiverId} ({selectedMail.receiver?.name || '정보 없음'})
                      </span>
                    </div>
                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>보낸 사람:</span>
                      <span className={styles.infoValue}>
                        {(selectedMail.sender?.email || selectedMail.senderId)} ({selectedMail.sender?.name || '정보 없음'})
                      </span>
                    </div>
                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>날짜:</span>
                      <span className={styles.infoValue}>{formatDate(selectedMail.createdAt)}</span>
                    </div>
                  </div>
                </div>
                <div className={styles.mailContentBody}>
                  {selectedMail.content}
                </div>
                <div className={styles.viewActions}>
                  <DefaultButton
                    text="목록으로"
                    onClick={() => setCurrentView(selectedMail.receiverId === userId ? 'inbox' : 'sent')}
                    variant="none"
                    width="hug"
                  />
                </div>
              </div>
            )}

            {currentView === 'compose' && !isSentSuccess && (
              <div className={styles.composeContainer}>
                <form onSubmit={handleSendMail} className={layoutStyles.form} noValidate>
                  <div className={layoutStyles.fieldGroup}>
                    <div className={layoutStyles.labelRow}>
                      <label className={layoutStyles.label}>
                        받는 사람 이메일
                        <FaAsterisk className={layoutStyles.requiredIcon} size={8} />
                      </label>
                    </div>
                    <div className={layoutStyles.inputWithAction}>
                      <TextInput
                        value={receiverEmail}
                        onChange={(val) => {
                          setReceiverEmail(val);
                          if (errorStatus?.field === 'receiverEmail') setErrorStatus(null);
                        }}
                        placeholder="상대방의 이메일 주소를 입력하세요"
                        required
                      />
                      <FieldButton
                        text="나에게 보내기"
                        type="button"
                        onClick={() => {
                          setReceiverEmail(userEmail);
                          if (errorStatus?.field === 'receiverEmail') setErrorStatus(null);
                        }}
                      />
                    </div>
                    {errorStatus?.field === 'receiverEmail' && (
                      <span className={layoutStyles.errorText}>
                        <IoAlertCircleOutline />
                        {errorStatus.message}
                      </span>
                    )}
                  </div>

                  <div className={layoutStyles.fieldGroup}>
                    <div className={layoutStyles.labelRow}>
                      <label className={layoutStyles.label}>
                        제목
                        <FaAsterisk className={layoutStyles.requiredIcon} size={8} />
                      </label>
                      <span className={`${layoutStyles.charCount} ${title.length >= 100 ? layoutStyles.charCountAtLimit : ''}`}>
                        {title.length}/100
                      </span>
                    </div>
                    <TextInput
                      value={title}
                      onChange={(val) => {
                        setTitle(val);
                        if (errorStatus?.field === 'title') setErrorStatus(null);
                      }}
                      placeholder="제목을 입력하세요"
                      required
                    />
                    {errorStatus?.field === 'title' && (
                      <span className={layoutStyles.errorText}>
                        <IoAlertCircleOutline />
                        {errorStatus.message}
                      </span>
                    )}
                  </div>

                  <div className={layoutStyles.fieldGroup}>
                    <div className={layoutStyles.labelRow}>
                      <label className={layoutStyles.label}>
                        내용
                        <FaAsterisk className={layoutStyles.requiredIcon} size={8} />
                      </label>
                      <span className={`${layoutStyles.charCount} ${content.length >= 1000 ? layoutStyles.charCountAtLimit : ''}`}>
                        {content.length}/1000
                      </span>
                    </div>
                    <TextArea
                      value={content}
                      onChange={(val) => {
                        setContent(val);
                        if (errorStatus?.field === 'content') setErrorStatus(null);
                      }}
                      placeholder="내용을 입력하세요"
                      rows={8}
                      required
                      maxLength={1000}
                    />
                    {errorStatus?.field === 'content' && (
                      <span className={layoutStyles.errorText}>
                        <IoAlertCircleOutline />
                        {errorStatus.message}
                      </span>
                    )}
                  </div>

                  <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
                    <DefaultButton
                      text={isSending ? '보내는 중...' : '보내기'}
                      type="submit"
                      variant="primary"
                      disabled={isSending}
                    />
                    <DefaultButton
                      text="취소"
                      onClick={() => {
                        setCurrentView('inbox');
                        setErrorStatus(null);
                      }}
                      variant="none"
                    />
                  </div>
                </form>
              </div>
            )}

            {currentView === 'compose' && isSentSuccess && (
              <div className={styles.emptyState}>
                <p style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text-main)', marginBottom: '16px' }}>
                  메일을 성공적으로 보냈습니다!
                </p>
                <DefaultButton
                  text="확인"
                  onClick={() => {
                    setIsSentSuccess(false);
                    setCurrentView('sent');
                  }}
                  variant="correct"
                  width="hug"
                />
              </div>
            )}
          </div>
        </section>

      </div>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="선택 삭제"
        message="선택한 메일을 삭제하시겠습니까?"
        confirmText="삭제"
        cancelText="취소"
        variant="danger"
        onConfirm={executeBulkDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
      />

      <AlertModal
        isOpen={alertModal.isOpen}
        title={alertModal.title}
        message={alertModal.message}
        onConfirm={alertModal.onConfirm}
      />
    </main>
  );
}
