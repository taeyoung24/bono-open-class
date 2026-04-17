'use client';

import ActionList from 'app/components/ActionList';
import formStyles from 'app/components/AuthFormLayout.module.css';
import { DefaultButton, FieldButton } from 'app/components/Button';
import SelectInput from 'app/components/SelectInput';
import TextArea from 'app/components/TextArea';
import TextInput from 'app/components/TextInput';
import layoutStyles from 'app/Layout.module.css';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import styles from './mailbox.module.css';

type MailView = 'inbox' | 'sent' | 'compose' | 'view';

export default function MailboxPage() {
  const router = useRouter();
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

  // 리스트 상태
  const [mails, setMails] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMail, setSelectedMail] = useState<any | null>(null);

  // 툴바 및 필터 상태
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

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
      console.error('Failed to fetch mails:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId && (currentView === 'inbox' || currentView === 'sent')) {
      fetchMails(currentView);
      setSelectedMail(null); // 뷰 전환 시 선택된 메일 초기화
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
        console.error('Failed to mark as read');
      }
    }
  };

  const handleSendMail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiverEmail || !title || !content) {
      alert('모든 필드를 입력해주세요.');
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
      } else {
        const data = await response.json();
        alert(data.message || '메일 발송에 실패했습니다.');
      }
    } catch (error) {
      alert('서버 통신 중 오류가 발생했습니다.');
    } finally {
      setIsSending(false);
    }
  };

  const navItems = [
    {
      label: '받은메일함',
      onClick: () => {
        setCurrentView('inbox');
        setIsSentSuccess(false);
        setSelectedMail(null);
        setSelectedIds([]);
        setSearchQuery('');
      }
    },
    {
      label: '보낸메일함',
      onClick: () => {
        setCurrentView('sent');
        setIsSentSuccess(false);
        setSelectedMail(null);
        setSelectedIds([]);
        setSearchQuery('');
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

  const handleDeleteSelected = async () => {
    if (!confirm('선택한 메일을 삭제하시겠습니까? (현재 데모이므로 화면에서만 임시 삭제됩니다)')) return;
    setMails(prev => prev.filter(m => !selectedIds.includes(m.id)));
    setSelectedIds([]);
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
              onClick={() => router.push('/dashboard')}
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
              {currentView === 'compose' && '새 메일 작성'}
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
                    
                    <div className={styles.mailList}>
                      {filteredMails.map((mail) => (
                        <div
                          key={mail.id}
                          className={`${styles.mailListItem} ${currentView === 'inbox' && !mail.isRead ? styles.unread : ''}`}
                          onClick={() => handleSelectMail(mail)}
                        >
                          <div className={styles.colCheckbox} onClick={(e) => e.stopPropagation()}>
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
                          <div className={styles.colName}>
                            {currentView === 'inbox' ? mail.sender?.name || mail.senderId : mail.receiver?.name || mail.receiverId}
                          </div>
                          <div className={styles.colTitleContent}>
                            <span className={styles.listMailTitle}>{mail.title}</span>
                          </div>
                          <div className={styles.colDate}>
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
                  <div className={styles.senderInfo}>
                    {selectedMail.senderId === userId ? (
                      <span>수신: {selectedMail.receiver?.name || selectedMail.receiverId} ({selectedMail.receiver?.email || selectedMail.receiverId})</span>
                    ) : (
                      <span>발신: {selectedMail.sender?.name || selectedMail.senderId} ({selectedMail.sender?.email || selectedMail.senderId})</span>
                    )}
                    <span style={{ marginLeft: '12px' }}>| {formatDate(selectedMail.createdAt)}</span>
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
                <form onSubmit={handleSendMail} className={formStyles.form}>
                <div className={formStyles.fieldGroup}>
                  <label className={formStyles.label}>받는 사람 이메일</label>
                  <div className={formStyles.inputWithAction}>
                    <TextInput
                      value={receiverEmail}
                      onChange={setReceiverEmail}
                      placeholder="상대방의 이메일 주소를 입력하세요"
                      required
                    />
                    <FieldButton
                      text="나에게 보내기"
                      type="button"
                      onClick={() => setReceiverEmail(userEmail)}
                    />
                  </div>
                </div>

                <div className={formStyles.fieldGroup}>
                  <label className={formStyles.label}>제목</label>
                  <TextInput
                    value={title}
                    onChange={setTitle}
                    placeholder="제목을 입력하세요"
                    required
                  />
                </div>

                <div className={formStyles.fieldGroup}>
                  <label className={formStyles.label}>내용</label>
                  <TextArea
                    value={content}
                    onChange={setContent}
                    placeholder="내용을 입력하세요"
                    rows={8}
                    required
                  />
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
                    onClick={() => setCurrentView('inbox')}
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
    </main>
  );
}
