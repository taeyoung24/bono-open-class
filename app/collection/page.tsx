import { logOut } from '@/app/actions'
import BadgeImage from '@/components/BadgeImage'
import { BADGE_GRADES, BadgeGrade } from '@/lib/constants'
import prisma from '@/lib/prisma'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import BadgeCard from '@/components/BadgeCard'

export default async function CollectionPage() {
  const cookieStore = await cookies()
  const studentId = cookieStore.get('studentId')?.value

  if (!studentId) {
    redirect('/')
  }

  const student = await prisma.student.findUnique({
    where: { id: parseInt(studentId) },
    include: {
      badges: {
        include: { badge: true }
      }
    }
  })

  if (!student) {
    redirect('/')
  }

  const allBadges = await prisma.badge.findMany()
  const earnedBadgeIds = student.badges.map((b) => b.badgeId)

  return (
    <main className="min-h-screen bg-gray-50 p-8 font-sans relative">
      <div className="max-w-4xl mx-auto">
        
        {/* 헤더: 무거운 카드 형태를 벗고 배경에 스며드는 미니멀 디자인으로 변경 */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pb-6 mb-10 border-b border-gray-200">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            <span className="text-blue-600">{student.name}</span>의 디지털 스탬프
          </h1>
          <form action={logOut}>
            <button 
              type="submit" 
              className="text-sm font-semibold text-gray-400 hover:text-gray-900 transition-colors cursor-pointer"
            >
              로그아웃
            </button>
          </form>
        </header>

        {/* 뱃지 진열장 그리드 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {allBadges.map((badge) => {
            const isEarned = earnedBadgeIds.includes(badge.id)
            const earnedInfo = student.badges.find((b) => b.badgeId === badge.id)
            const gradeInfo = BADGE_GRADES[badge.grade as BadgeGrade] || BADGE_GRADES[1]

            return (
              <BadgeCard 
                key={badge.id}
                badge={badge}
                isEarned={isEarned}
                earnedInfo={earnedInfo}
                gradeInfo={gradeInfo}
              />
            )
          })}
        </div>
      </div>
    </main>
  )
}