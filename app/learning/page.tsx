import prisma from '@/lib/prisma'
import Link from 'next/link'
import styles from './Learning.module.css'
import ThemeImage from './ThemeImage'

export default async function LearningThemePage() {
  const themes = await prisma.theme.findMany({
    orderBy: { id: 'asc' },
  })

  return (
    <div className={styles.pageWrapper}>
      <main className={styles.main}>
        {/* 상단 안내 메시지 */}
        <div className={styles.messageBox}>
          <p className={styles.message}>학습 테마를 선택해 주세요</p>
        </div>

        {themes.length === 0 ? (
          <div className={styles.empty}>학습 테마가 존재하지 않습니다.</div>
        ) : (
          <div className={styles.themeList}>
            {themes.map((theme) => (
              <Link key={theme.id} href={`/learning/${theme.id}`} className={styles.themeCard}>
                <ThemeImage id={theme.id} name={theme.name} className={styles.coverImage} />
              </Link>
            ))}
          </div>
        )}

        {/* 하단 닫기 버튼 */}
        <footer className={styles.footer}>
          <Link href="/dashboard" className={styles.closeBtn} title="닫기">
            &times;
          </Link>
        </footer>
      </main>
    </div>
  )
}
