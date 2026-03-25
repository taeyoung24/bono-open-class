'use client'

import { useState } from 'react'
import { updateEmail } from '../actions'
import styles from './Dashboard.module.css'

export default function EditProfileButton({ currentEmail }: { currentEmail: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [email, setEmail] = useState(currentEmail || '')
  const [isLoading, setIsLoading] = useState(false)

  const handleSave = async () => {
    setIsLoading(true)
    await updateEmail(email)
    setIsLoading(false)
    setIsOpen(false)
  }

  return (
    <>
      <button className={styles.btnSecondary} onClick={() => setIsOpen(true)}>
        프로필 수정
      </button>

      {isOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3 className={styles.modalTitle}>이메일 수정</h3>
            <p className={styles.modalText}>
              변경하거나 새로 등록할 이메일 주소를 입력해주세요.
            </p>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              className={styles.input}
              autoFocus
            />
            <div className={styles.modalActions}>
              <button
                type="button"
                className={`${styles.btnSecondary} ${styles.modalBtn}`}
                onClick={() => setIsOpen(false)}
                disabled={isLoading}
              >
                취소
              </button>
              <button
                type="button"
                className={`${styles.btnPrimary} ${styles.modalBtn}`}
                onClick={handleSave}
                disabled={isLoading}
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
