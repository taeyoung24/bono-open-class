'use server'

import prisma from '@/lib/prisma'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

// 로그인 체크 또는 계정 생성 통합 함수
export async function handleAuth(name: string, secretCode: string, email: string, action: 'CHECK' | 'CREATE') {
  const cookieStore = await cookies()

  // 1. 기존 유저 확인 (동명이인이라도 이름+암호가 같으면 본인으로 취급)
  if (action === 'CHECK') {
    const student = await prisma.student.findFirst({
      where: { name, secretCode }
    })

    if (student) {
      // 존재하면 로그인 성공
      cookieStore.set('studentId', student.id.toString(), { httpOnly: true, path: '/' })
      return { success: true }
    } else {
      // 없으면 모달을 띄우기 위해 notFound 반환
      return { success: false, notFound: true }
    }
  }

  // 2. 새 유저 생성 (모달에서 '네, 만들게요' 눌렀을 때 실행)
  if (action === 'CREATE') {
    const newStudent = await prisma.student.create({
      data: { name, secretCode, email: email || null }
    })
    
    cookieStore.set('studentId', newStudent.id.toString(), { httpOnly: true, path: '/' })
    return { success: true }
  }
}

import { revalidatePath } from 'next/cache'

// 학생 이메일 정보 수정 함수
export async function updateEmail(email: string) {
  const cookieStore = await cookies()
  const studentId = cookieStore.get('studentId')?.value

  if (!studentId) return { success: false }

  await prisma.student.update({
    where: { id: parseInt(studentId) },
    data: { email: email.trim() || null }
  })
  
  // 데이터가 변경되었음을 알려 대시보드 화면을 갱신하도록 함
  revalidatePath('/dashboard')
  
  return { success: true }
}

export async function logOut() {
  const cookieStore = await cookies()
  cookieStore.delete('studentId')
  redirect('/')
}

// 과제 상태 토글 액션 (WAITING <-> IN_PROGRESS 만 가능)
export async function toggleTaskStatus(taskId: number) {
  const cookieStore = await cookies()
  const studentIdStr = cookieStore.get('studentId')?.value
  if (!studentIdStr) return { success: false, error: 'Unauthorized' }

  const studentId = parseInt(studentIdStr)

  // 1. 현재 진도 상태 확인
  const progress = await prisma.studentProgress.findUnique({
    where: {
      studentId_taskId: { studentId, taskId }
    }
  })

  let nextStatus = 'IN_PROGRESS'
  
  if (progress) {
    // 이미 있는 기록인 경우
    if (progress.status === 'DONE') {
      return { success: false, error: 'Already completed by admin' }
    }
    
    // 토글 로직: IN_PROGRESS -> WAITING / WAITING -> IN_PROGRESS
    nextStatus = progress.status === 'IN_PROGRESS' ? 'WAITING' : 'IN_PROGRESS'

    await prisma.studentProgress.update({
      where: { id: progress.id },
      data: { status: nextStatus }
    })
  } else {
    // 기록이 없으면 처음 클릭한 것이므로 IN_PROGRESS로 생성
    await prisma.studentProgress.create({
      data: {
        studentId,
        taskId,
        status: 'IN_PROGRESS'
      }
    })
  }

  // 화면 갱신을 위해 해당 테마 페이지 재검증
  revalidatePath('/learning/[themeId]', 'page')
  
  return { success: true, status: nextStatus }
}
