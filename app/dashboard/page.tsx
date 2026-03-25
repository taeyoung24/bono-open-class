import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import styles from './Dashboard.module.css'
import { logOut } from '../actions'
import EditProfileButton from './EditProfileButton'

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const studentId = cookieStore.get('studentId')?.value

  if (!studentId) {
    redirect('/login')
  }

  const student = await prisma.student.findUnique({
    where: { id: parseInt(studentId) },
    include: {
      artworks: {
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  })

  if (!student) {
    redirect('/login')
  }

  return (
    <div className={styles.pageWrapper}>
      <main className={styles.container}>
        {/* 1. 상단 가로 배너 영역 */}
        <div className={styles.banner}></div>

        {/* 2. 학생 정보 (왼쪽 정렬, 배너 겹침) */}
        <section className={styles.profileSection}>
          <div className={styles.avatarContainer}>
            <div className={styles.avatarImage} />
          </div>
          
          <div className={styles.userInfo}>
            <div className={styles.infoRow}>
              <div>
                <h1 className={styles.userName}>{student.name}</h1>
                {student.email && <p className={styles.userEmail}>{student.email}</p>}
                <p className={styles.userPoints}>
                  포인트: <strong>{student.points.toLocaleString()}P</strong>
                </p>
              </div>
              
              <form action={logOut}>
                <button type="submit" className={styles.logoutBtn}>
                  로그아웃
                </button>
              </form>
            </div>
          </div>
          
          {/* 주요 액션 버튼 영역 */}
          <div className={styles.actionButtons}>
            <EditProfileButton currentEmail={student.email || ''} />
            <button className={styles.btnPrimary}>학습하기</button>
          </div>
        </section>

        {/* 3. 완성작 포트폴리오 갤러리 (가로 폭 제한 유지, 타이트한 3열 그리드) */}
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
