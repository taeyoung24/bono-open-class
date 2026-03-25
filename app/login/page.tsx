'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { handleAuth } from '../actions' // 상위 디렉토리(app/)의 actions를 참조
import styles from './Page.module.css'

export default function LoginPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [secretCode, setSecretCode] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  const [errorMessage, setErrorMessage] = useState('')

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')

    if (!name.trim()) {
      setErrorMessage('학생 이름을 입력해주세요.')
      return
    }
    if (secretCode.length < 4) {
      setErrorMessage('암호는 4자 이상 입력해야 합니다.')
      return
    }

    setIsLoading(true)
    const res = await handleAuth(name, secretCode, '', 'CHECK')
    
    if (res?.success) {
      router.push('/dashboard') // 새로 만들 대시보드 페이지로 이동
    } else if (res?.notFound) {
      setShowModal(true)
    }
    
    setIsLoading(false)
  }

  const handleCreate = async () => {
    setIsLoading(true)
    const res = await handleAuth(name, secretCode, '', 'CREATE')
    if (res?.success) {
      router.push('/dashboard')
    }
    setIsLoading(false)
  }

  return (
    <main className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>로그인</h1>
        <p className={styles.subtitle}>본오동 열린 컴퓨터 교실</p>
        
        <form onSubmit={onSubmit} noValidate>
          <div className={styles.formGroup}>
            <label className={styles.label}>이름</label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (errorMessage) setErrorMessage('')
              }}
              placeholder="자신의 이름을 입력하세요"
              className={styles.input}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label className={styles.label}>암호</label>
            <input
              type="password"
              value={secretCode}
              onChange={(e) => {
                setSecretCode(e.target.value)
                if (errorMessage) setErrorMessage('')
              }}
              placeholder="영문/숫자 4자 이상"
              className={styles.input}
            />
          </div>
          
          <div className={styles.errorContainer}>
            {errorMessage && (
              <p className={styles.errorMessage}>
                {errorMessage}
              </p>
            )}
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className={styles.button}
          >
            {isLoading ? '확인 중...' : '시작하기'}
          </button>
        </form>
      </div>

      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3 className={styles.modalTitle}>새로운 학생 등록</h3>
            <p className={styles.modalText}>
              <strong>{name}</strong> 학생의 계정이 없습니다.<br/>
              입력하신 정보로 새로 등록할까요?
            </p>
            <div className={styles.modalActions}>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className={`${styles.button} ${styles.buttonSecondary}`}
                disabled={isLoading}
              >
                취소
              </button>
              <button
                type="button"
                disabled={isLoading}
                onClick={handleCreate}
                className={styles.button}
              >
                등록하기
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
