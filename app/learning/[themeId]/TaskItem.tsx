'use client'

import { toggleTaskStatus } from '@/app/actions'
import { HiOutlineClock, HiOutlinePlayCircle, HiOutlineCheckCircle, HiOutlineLockClosed, HiOutlineArrowTopRightOnSquare } from 'react-icons/hi2'
import styles from './ThemeDetail.module.css'
import { useState } from 'react'

interface TaskItemProps {
  task: {
    id: number
    title: string
    description: string | null
    url: string | null
    prevId: number | null
  }
  initialStatus: string
  prevTaskTitle?: string
}

export default function TaskItem({ task, initialStatus, prevTaskTitle }: TaskItemProps) {
  const [status, setStatus] = useState(initialStatus)
  const [isUpdating, setIsUpdating] = useState(false)
  const [showPop, setShowPop] = useState(false)

  const handleToggle = async () => {
    if (status === 'DONE' || isUpdating) return

    setIsUpdating(true)
    const res = await toggleTaskStatus(task.id)
    if (res.success && res.status) {
      if (res.status === 'IN_PROGRESS') {
        setShowPop(true)
        setTimeout(() => setShowPop(false), 800) // 애니메이션 종료 후 상태 리셋
      }
      setStatus(res.status)
    }
    setIsUpdating(false)
  }

  return (
    <div 
      className={`${styles.taskCard} ${status === 'DONE' ? styles.isDone : ''} ${isUpdating ? styles.updating : ''}`}
      onClick={handleToggle}
    >
      {/* 상태 아이콘 (좌측 배치) */}
      <div className={`${styles.statusIcon} ${styles[`status_${status}`]}`}>
        {status === 'WAITING' && <HiOutlineClock size={22} />}
        {status === 'IN_PROGRESS' && <HiOutlinePlayCircle size={22} />}
        {status === 'DONE' && <HiOutlineCheckCircle size={22} />}
        {showPop && <div className={styles.burstEffect} />}
      </div>
      
      <div className={styles.taskInfo}>
        <div className={styles.taskText}>
          <div className={styles.titleRow}>
            <h3 className={styles.taskTitle}>{task.title}</h3>
            
            {/* 선수 과제(prev) 힌트 아이콘 */}
            {prevTaskTitle && (
              <div className={styles.prevTaskTooltip} data-tooltip={`선수 과제: ${prevTaskTitle}`}>
                <HiOutlineLockClosed size={16} />
              </div>
            )}
          </div>
          {task.description && <p className={styles.taskDesc}>{task.description}</p>}
        </div>

        {/* URL이 있는 경우 외부 링크 버튼 표시 (+ 클릭 이벤트 버블링 방지) */}
        {task.url && (
          <a 
            href={task.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className={styles.taskLinkBtn}
            onClick={(e) => e.stopPropagation()} 
          >
            <HiOutlineArrowTopRightOnSquare size={16} />
            <span>바로가기</span>
          </a>
        )}
      </div>
    </div>
  )
}
