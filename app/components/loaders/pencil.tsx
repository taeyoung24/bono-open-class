import React from 'react';
import styles from './pencil.module.css';

const Loader = () => {
  return (
    <div className={styles.loaderContainer}>
      <svg xmlns="http://www.w3.org/2000/svg" height="200px" width="200px" viewBox="0 0 200 200" className={styles.pencil}>
        <defs>
          <clipPath id="pencil-eraser">
            <rect height={30} width={30} ry={5} rx={5} />
          </clipPath>
        </defs>
        <circle 
          transform="rotate(-113,100,100)" 
          strokeLinecap="round" 
          strokeDashoffset="439.82" 
          strokeDasharray="439.82 439.82" 
          strokeWidth={2} 
          stroke="currentColor" 
          fill="none" 
          r={70} 
          className={styles.pencilStroke} 
        />
        <g transform="translate(100,100)" className={styles.pencilRotate}>
          <g fill="none">
            <circle 
              transform="rotate(-90)" 
              strokeDashoffset={402} 
              strokeDasharray="402.12 402.12" 
              strokeWidth={30} 
              r={64} 
              className={styles.pencilBody1} 
            />
            <circle 
              transform="rotate(-90)" 
              strokeDashoffset={465} 
              strokeDasharray="464.96 464.96" 
              strokeWidth={10} 
              r={74} 
              className={styles.pencilBody2} 
            />
            <circle 
              transform="rotate(-90)" 
              strokeDashoffset={339} 
              strokeDasharray="339.29 339.29" 
              strokeWidth={10} 
              r={54} 
              className={styles.pencilBody3} 
            />
          </g>
          <g transform="rotate(-90) translate(49,0)" className={styles.pencilEraser}>
            <g className={styles.pencilEraserSkew}>
              {/* 지우개 부분: 프로젝트의 에러/실패 테마색(분홍/레드 계열) 활용 */}
              <rect height={30} width={30} ry={5} rx={5} fill="var(--status-failure)" style={{ opacity: 0.7 }} />
              <rect clipPath="url(#pencil-eraser)" height={30} width={5} fill="var(--status-failure)" />
              <rect height={20} width={30} fill="var(--bg-input)" />
              <rect height={20} width={15} fill="var(--text-muted)" />
              <rect height={20} width={5} fill="var(--text-sub)" />
              <rect height={2} width={30} y={6} fill="rgba(0,0,0,0.1)" />
              <rect height={2} width={30} y={13} fill="rgba(0,0,0,0.1)" />
            </g>
          </g>
          <g transform="rotate(-90) translate(49,-30)" className={styles.pencilPoint}>
            {/* 연필 끝부분: 포인트 컬러(옐로우/골드) 활용 */}
            <polygon points="15 0,30 30,0 30" fill="var(--accent-secondary)" />
            <polygon points="15 0,6 30,0 30" fill="var(--accent-secondary-hover)" />
            <polygon points="15 0,20 10,10 10" fill="var(--text-main)" />
          </g>
        </g>
      </svg>
    </div>
  );
}

export default Loader;
