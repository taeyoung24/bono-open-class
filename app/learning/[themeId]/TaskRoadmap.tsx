'use client'

import { useState } from 'react'
import { HiOutlineClock, HiOutlinePlayCircle, HiOutlineCheckCircle, HiOutlineArrowTopRightOnSquare } from 'react-icons/hi2'
import styles from './ThemeDetail.module.css'

interface Task {
  id: number
  title: string
  description: string | null
  url: string | null
}

interface Progress {
  taskId: number
  status: string
}

export default function TaskRoadmap({ tasks, initialProgress }: { tasks: Task[], initialProgress: Progress[] }) {
  const [selectedTask, setSelectedTask] = useState<Task>(tasks[0])

  return (
    <section className={styles.taskSection}>
      <div className={styles.roadmapContainer}>
        <div className={styles.roadmapLine} />
        <div className={styles.taskNodes}>
          {tasks.map((task) => {
            const progress = initialProgress.find((p) => p.taskId === task.id)
            const status = progress?.status || 'WAITING'
            const isSelected = selectedTask.id === task.id

            return (
              <div 
                key={task.id} 
                className={`${styles.taskNode} ${isSelected ? styles.selected : ''}`}
                data-title={task.title}
                onClick={() => setSelectedTask(task)}
              >
                <div className={`${styles.statusIcon} ${styles[`status_${status}`]}`}>
                  {status === 'WAITING' && <HiOutlineClock size={24} />}
                  {status === 'IN_PROGRESS' && <HiOutlinePlayCircle size={24} />}
                  {status === 'DONE' && <HiOutlineCheckCircle size={24} />}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 선택된 과제 상세 정보 패널 */}
      <div className={styles.detailPanel}>
        <h3 className={styles.detailTitle}>{selectedTask.title}</h3>
        {selectedTask.description && <p className={styles.detailDesc}>{selectedTask.description}</p>}
        
        {selectedTask.url && (
          <a 
            href={selectedTask.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className={styles.taskLinkBtn}
          >
            <HiOutlineArrowTopRightOnSquare size={18} />
            <span>이 과제 수행하러 가기</span>
          </a>
        )}
      </div>
    </section>
  )
}
