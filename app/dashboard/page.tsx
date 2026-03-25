import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import prisma from '@/lib/prisma'
import styles from './Dashboard.module.css'
import { logOut } from '../actions'
import EditProfileButton from './EditProfileButton'
import ThemeImage from '../learning/ThemeImage'
import { HiOutlineLogout } from 'react-icons/hi'

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const studentId = cookieStore.get('studentId')?.value

  if (!studentId) {
    redirect('/login')
  }

  // 로그인한 학생 정보 및 모든 학습 테마 데이터 검색
  const [student, themes] = await Promise.all([
    prisma.student.findUnique({
      where: { id: parseInt(studentId) },
      include: {
        artworks: { orderBy: { createdAt: 'desc' } },
      },
    }),
    prisma.theme.findMany({
      orderBy: { id: 'asc' },
    })
  ])

  if (!student) {
    redirect('/login')
  }

  return (
    <div className={styles.pageWrapper}>
      <main className={styles.container}>
        {/* 상단 로그아웃 바 */}
        <div className={styles.topBar}>
          <form action={logOut}>
            <button type="submit" className={styles.logoutBtnPill}>
              <HiOutlineLogout size={18} />
              <span>로그아웃</span>
            </button>
          </form>
        </div>

        {/* 1. 학생 정보 섹션 */}
        <section className={styles.profileSection}>
          <div className={styles.userInfo}>
            <div className={styles.nameRow}>
              <h1 className={styles.userName}>{student.name}</h1>
              <EditProfileButton currentEmail={student.email || ''} />
            </div>
            {student.email && <p className={styles.userEmail}>{student.email}</p>}
            <p className={styles.userPoints}>
              포인트: <strong>{student.points.toLocaleString()}P</strong>
            </p>
          </div>
        </section>

        {/* 2. 학습 테마 선택 섹션 (대시보드 통합 타입) */}
        <section className={styles.learningSection}>
          <div className={styles.themeList}>
            {themes.map((theme) => (
              <Link key={theme.id} href={`/learning/${theme.id}`} className={styles.themeCard}>
                <ThemeImage id={theme.id} name={theme.name} className={styles.coverImage} />
              </Link>
            ))}
          </div>
        </section>

        {/* 3. 완성작 포트폴리오 갤러리 */}
        <section className={styles.gallerySection}>
          <div className={styles.grid}>
            {student.artworks && student.artworks.length > 0 ? (
              student.artworks.map((art) => (
                <div key={art.id} className={styles.gridItem}>
                  <img
                    src={art.imageUrl}
                    alt={art.label || '완성작'}
                    className={styles.gridImage}
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/300?text=No+Image'
                    }}
                  />
                  
                  <div className={styles.itemOverlay}>
                    {art.label && <h3 className={styles.overlayLabel}>{art.label}</h3>}
                    <p className={styles.overlayDate}>{art.date}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.empty}>
                아직 포트폴리오가 비어있습니다.
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}
