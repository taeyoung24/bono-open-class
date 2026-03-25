import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import prisma from '@/lib/prisma'
import styles from './ThemeDetail.module.css'
import ThemeImage from '../ThemeImage'
import TaskItem from './TaskItem'
import { 
  HiOutlineClock, 
  HiOutlinePlayCircle, 
  HiOutlineCheckCircle, 
  HiChevronLeft, 
  HiOutlineArrowTopRightOnSquare,
  HiOutlineLockClosed
} from 'react-icons/hi2'

// Next.js 15 동적 라우팅 대응 (params는 Promise로 취급)
export default async function ThemeDetailPage({ params }: { params: Promise<{ themeId: string }> | { themeId: string } }) {
  const cookieStore = await cookies()
  const studentId = cookieStore.get('studentId')?.value

  if (!studentId) {
    redirect('/login')
  }
  
  // 파라미터 언래핑 처리
  const resolvedParams = await Promise.resolve(params);
  const themeId = parseInt(resolvedParams.themeId, 10)

  // 테마 정보, 해당 과제 리스트 (Task), 그리고 학생의 진도 정보를 모두 가져옴
  const theme = await prisma.theme.findUnique({
    where: { id: themeId },
    include: {
      tasks: {
        orderBy: { id: 'asc' }, // 순차적 정렬 기반
      },
    },
  })

  if (!theme) {
    redirect('/dashboard')
  }

  // 개인 학생의 해당 테마 과제 진행도 검색
  const student = await prisma.student.findUnique({
    where: { id: parseInt(studentId) },
    include: {
      progress: {
        where: { task: { themeId } }
      }
    }
  })

  // 진행도 계산
  const totalTasks = theme.tasks.length
  const doneTasks = student?.progress.filter(p => p.status === 'DONE').length || 0

  return (
    <div className={styles.pageWrapper}>
      <main className={styles.container}>
        {/* 1. 상단 헤더 섹션 (정보형 레이아웃) */}
        <header className={styles.headerSection}>
          <div className={styles.topBar}>
            <Link href="/dashboard" className={styles.backBtn}>
              <HiChevronLeft size={20} />
              <span>돌아가기</span>
            </Link>
          </div>

          <div className={styles.headerContent}>
            <div className={styles.themeCoverWrapper}>
              <ThemeImage id={theme.id} name={theme.name} className={styles.themeCover} />
            </div>
            <div className={styles.themeInfo}>
              <div className={styles.titleRowMain}>
                {/* 1. 도넛 프로그레스 바 */}
                <svg className={styles.donutSvg} viewBox="0 0 36 36">
                  <circle
                    className={styles.donutBg}
                    cx="18" cy="18" r="15.9155"
                  />
                  <circle
                    className={styles.donutFill}
                    cx="18" cy="18" r="15.9155"
                    strokeDasharray={`${totalTasks > 0 ? (doneTasks / totalTasks) * 100 : 0} 100`}
                    transform="rotate(-90 18 18)"
                  />
                </svg>
                {/* 2. 테마 제목 */}
                <h1 className={styles.themeName}>{theme.name}</h1>
              </div>

              {/* 3. 완료 텍스트 (바 삭제) */}
              <div className={styles.themeStats}>
                <span className={styles.statText}>
                  총 {totalTasks}개의 과제 중 {doneTasks}개를 완료했어요
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* 2. 하단 Task 렌더링 영역 */}
        <section className={styles.taskSection}>
          <h2 className={styles.sectionTitle}>학습 과제 목록</h2>
          
          <div className={styles.taskList}>
            {theme.tasks.length > 0 ? (
              theme.tasks.map((task) => {
                const progress = student?.progress.find((p) => p.taskId === task.id)
                const status = progress?.status || 'WAITING'
                const prevTaskTitle = task.prevId ? theme.tasks.find((t) => t.id === task.prevId)?.title : undefined
                
                return (
                  <TaskItem 
                    key={task.id}
                    task={{
                      id: task.id,
                      title: task.title,
                      description: task.description,
                      url: task.url,
                      prevId: task.prevId
                    }}
                    initialStatus={status}
                    prevTaskTitle={prevTaskTitle}
                  />
                )
              })
            ) : (
              <p className={styles.empty}>등록된 과제가 없습니다.</p>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}
