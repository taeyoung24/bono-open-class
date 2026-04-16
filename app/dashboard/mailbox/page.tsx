'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import layoutStyles from 'app/Layout.module.css';
import styles from './mailbox.module.css';
import { DefaultButton, TextButton } from 'app/components/Button';
import ActionList from 'app/components/ActionList';
import TextInput from 'app/components/TextInput';
import TextArea from 'app/components/TextArea';
import formStyles from 'app/components/AuthFormLayout.module.css';

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
      }
    },
    { 
      label: '보낸메일함', 
      onClick: () => {
        setCurrentView('sent');
        setIsSentSuccess(false);
      }
    }
  ];

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
              {currentView === 'view' && '메일 읽기'}
            </h3>
          </div>

          <div className={styles.mainContent}>
            {(currentView === 'inbox' || currentView === 'sent') && (
              <div className={styles.emptyState}>
                <p>표시할 메일이 없습니다.</p>
              </div>
            )}
            
            {currentView === 'compose' && !isSentSuccess && (
              <form onSubmit={handleSendMail} className={formStyles.form}>
                <div className={formStyles.fieldGroup}>
                  <label className={formStyles.label}>받는 사람 이메일</label>
                  <TextInput 
                    value={receiverEmail} 
                    onChange={setReceiverEmail} 
                    placeholder="상대방의 이메일 주소를 입력하세요" 
                    required 
                  />
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
                    rows={10}
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
