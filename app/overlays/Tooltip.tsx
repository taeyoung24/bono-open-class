import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import styles from './Tooltip.module.css';

interface TooltipProps {
  children: React.ReactNode;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  show?: boolean;
  className?: string;
}

export default function Tooltip({ 
  children, 
  content, 
  position = 'top',
  delay = 0,
  show,
  className = ''
}: TooltipProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const updateCoords = useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      let t = 0, l = 0;
      const gap = 8;

      switch (position) {
        case 'top':
          t = rect.top - gap;
          l = rect.left + rect.width / 2;
          break;
        case 'bottom':
          t = rect.bottom + gap;
          l = rect.left + rect.width / 2;
          break;
        case 'left':
          t = rect.top + rect.height / 2;
          l = rect.left - gap;
          break;
        case 'right':
          t = rect.top + rect.height / 2;
          l = rect.right + gap;
          break;
      }
      setCoords({ top: t, left: l });
    }
  }, [position]);

  useEffect(() => {
    const isVisible = show !== undefined ? show : isHovered;
    if (isVisible) {
      updateCoords();
      window.addEventListener('scroll', updateCoords, true);
      window.addEventListener('resize', updateCoords);
    }
    return () => {
      window.removeEventListener('scroll', updateCoords, true);
      window.removeEventListener('resize', updateCoords);
    };
  }, [isHovered, show, updateCoords]);

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

  const tooltipElement = (
    <div 
      className={`${styles.tooltip} ${styles[position]} ${isVisible ? styles.visible : ''}`}
      style={{ 
        position: 'fixed',
        top: coords.top, 
        left: coords.left,
        zIndex: 10000,
        pointerEvents: 'none'
      }}
    >
      {content}
    </div>
  );

  return (
    <>
      <div 
        ref={triggerRef}
        className={`${styles.tooltipWrapper} ${className}`}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
      >
        {children}
      </div>
      {mounted && createPortal(tooltipElement, document.body)}
    </>
  );
}
