'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { handleAuth } from './actions'
import Button from '@/components/Button'

export default function Home() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [secretCode, setSecretCode] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  // 커스텀 에러 메시지를 담을 상태
  const [errorMessage, setErrorMessage] = useState('')

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('') // 제출 시도 시 기존 에러 초기화

    // 1. 커스텀 유효성 검사 (브라우저 기본 알림 대체)
    if (!name.trim()) {
      setErrorMessage('학생 이름을 입력해주세요.')
      return
    }
    if (secretCode.length < 4) {
      setErrorMessage('암호는 4자 이상 입력해야 합니다.')
      return
    }

    setIsLoading(true)
    const res = await handleAuth(name, secretCode, 'CHECK')
    
    if (res?.success) {
      router.push('/collection')
    } else if (res?.notFound) {
      setShowModal(true)
    }
    
    setIsLoading(false)
  }

  const handleCreate = async () => {
    setIsLoading(true)
    const res = await handleAuth(name, secretCode, 'CREATE')
    if (res?.success) {
      router.push('/collection')
    }
    setIsLoading(false)
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4 relative font-sans">
      
      <div className="max-w-sm w-full border border-gray-200 rounded-3xl p-10 bg-white">
        {/* form에 noValidate를 추가해 브라우저 기본 말풍선을 끕니다 */}
        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-400 pl-1">이름</label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (errorMessage) setErrorMessage('') // 타이핑 시작하면 에러 끄기
              }}
              placeholder="이름을 입력하세요"
              // focus:ring 관련 클래스 모두 제거하고 얇은 테두리(border)만 남김
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-blue-500 transition-colors text-gray-900 placeholder:text-gray-300"
            />
          </div>
          
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-400 pl-1">암호</label>
            <input
              type="password"
              value={secretCode}
              onChange={(e) => {
                setSecretCode(e.target.value)
                if (errorMessage) setErrorMessage('')
              }}
              placeholder="암호 (영문/숫자 4자 이상)"
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-blue-500 transition-colors text-gray-900 placeholder:text-gray-300"
            />
          </div>
          
          {/* 에러 메시지 출력 영역 (높이를 고정하여 UI가 덜컹거리지 않게 함) */}
          <div className="h-4 flex items-center justify-center -mb-1 mt-1">
            {errorMessage && (
              <p className="text-xs font-bold text-red-500 animate-in fade-in duration-200">
                {errorMessage}
              </p>
            )}
          </div>
          
          <Button
            type="submit"
            disabled={isLoading}
            className="py-4"
          >
            {isLoading ? '확인 중...' : '내 스탬프 보기'}
          </Button>
        </form>
      </div>

      {/* 모달 (기존과 동일하게 Button 컴포넌트 적용) */}
      {showModal && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="max-w-xs w-full bg-white border border-gray-100 rounded-3xl p-6 text-center animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold mb-2 text-gray-900">새로운 학생 등록</h3>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed break-keep">
              <span className="font-bold text-blue-600">{name}</span> 학생의 데이터가 없습니다.<br/>
              입력하신 정보로 새로 등록할까요?
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowModal(false)}
                className="py-3.5 flex-1"
              >
                취소
              </Button>
              <Button
                type="button"
                disabled={isLoading}
                onClick={handleCreate}
                className="py-3.5 flex-1"
              >
                등록하기
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}