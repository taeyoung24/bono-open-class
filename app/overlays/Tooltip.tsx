import React, { useState } from 'react';
import styles from './Tooltip.module.css';

interface TooltipProps {
  children: React.ReactNode;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  show?: boolean; // 수동 제어용 프롭 추가
}

export default function Tooltip({ 
  children, 
  content, 
  position = 'top',
  delay = 0,
  show
}: TooltipProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

  const showTooltip = () => {
    const showTimer = setTimeout(() => {
      setIsHovered(true);
    }, delay);
    setTimer(showTimer);
  };

  const hideTooltip = () => {
    if (timer) clearTimeout(timer);
    setIsHovered(false);
  };

  const isVisible = show !== undefined ? show : isHovered;

  return (
    <div 
      className={styles.tooltipWrapper}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
    >
      {children}
      <div className={`${styles.tooltip} ${styles[position]} ${isVisible ? styles.visible : ''}`}>
        {content}
      </div>
    </div>
  );
}
