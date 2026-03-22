'use server'

import prisma from '@/lib/prisma'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

// 로그인 체크 또는 계정 생성 통합 함수
export async function handleAuth(name: string, secretCode: string, action: 'CHECK' | 'CREATE') {
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
      data: { name, secretCode }
    })
    
    cookieStore.set('studentId', newStudent.id.toString(), { httpOnly: true, path: '/' })
    return { success: true }
  }
}

export async function logOut() {
  const cookieStore = await cookies()
  cookieStore.delete('studentId')
  redirect('/')
}
