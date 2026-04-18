'use client';

import React from 'react';
import styles from './typing-records.module.css';
import Tooltip from 'app/overlays/Tooltip';

interface ProficiencyGaugeProps {
  currentCpm: number;
}

export default function ProficiencyGauge({ currentCpm }: ProficiencyGaugeProps) {
  const positionPercentage = Math.min((currentCpm / 600) * 100, 100);
  const currentSegmentIndex = Math.min(Math.floor(currentCpm / 100), 5);

  const segments = [
    { label: 'BEGINNER', color: 'var(--spectrum-yellow)', desc: '올바른 손가락 위치를 익히는 단계' },
    { label: 'BEGINNER', color: 'var(--spectrum-yellow)', desc: '키보드를 보지 않고 치는 단계' },
    { label: 'SKILLED', color: 'var(--spectrum-orange)', desc: '안정적으로 타이핑하는 단계' },
    { label: 'SKILLED', color: 'var(--spectrum-orange)', desc: '키보드가 익숙하고 빨라지는 단계' },
    { label: 'EXPERT', color: 'var(--spectrum-red)', desc: '빠르고 정확하게 입력하는 단계' },
    { label: 'EXPERT', color: 'var(--spectrum-red)', desc: '최고 수준의 솜씨를 자랑하는 단계' },
  ];

  const getTierInfo = (cpm: number) => {
    if (cpm < 200) return { id: 'BEGINNER', name: '초보자', color: 'var(--spectrum-yellow)' };
    if (cpm < 400) return { id: 'SKILLED', name: '숙련자', color: 'var(--spectrum-orange)' };
    return { id: 'EXPERT', name: '실력자', color: 'var(--spectrum-red)' };
  };

  const currentTier = getTierInfo(currentCpm);

  // 툴팁 위치 결정 로직: 양 끝에서는 안쪽으로 향하게 유도
  const getTooltipPosition = (index: number) => {
    if (index === 0) return 'right';
    if (index === 5) return 'left';
    return 'top';
  };

  return (
    <div className={styles.gaugeContainer}>
      {/* 삼각형 포인터 */}
      <div
        className={styles.gaugeMarker}
        style={{ left: `${positionPercentage}%` }}
      >
        <span className={styles.markerValue} style={{ color: currentTier.color }}>
          {currentCpm}
        </span>
        <div
          className={styles.markerTriangle}
          style={{ borderTop: `8px solid ${currentTier.color}` }}
        ></div>
      </div>

      {/* 6분할 분절 바 */}
      <div className={styles.gaugeBar}>
        {segments.map((seg, index) => (
          <div key={index} className={styles.segmentWrapper}>
            <Tooltip content={seg.desc} position={getTooltipPosition(index)}>
              <div
                className={`${styles.gaugeSegment} ${index === currentSegmentIndex ? styles.active : ''}`}
                style={{ backgroundColor: seg.color }}
              ></div>
            </Tooltip>
          </div>
        ))}
      </div>

      {/* 통합 라벨 행 */}
      <div className={styles.gaugeLabelRow}>
        <div className={styles.labelItem} style={{ left: '0%' }}>
          <span className={styles.labelNum}>0</span>
        </div>
        <div className={styles.labelItem} style={{ left: '33.33%' }}>
          <span className={styles.labelNum}>200</span>
        </div>
        <div className={styles.labelItem} style={{ left: '66.66%' }}>
          <span className={styles.labelNum}>400</span>
        </div>
        <div className={styles.labelItem} style={{ left: '100%' }}>
          <span className={styles.labelNum}>600+</span>
        </div>

        <div className={styles.labelItem} style={{ left: '16.66%' }}>
          <span
            className={`${styles.labelTier} ${currentTier.id === 'BEGINNER' ? styles.active : ''}`}
            style={{ color: currentTier.id === 'BEGINNER' ? currentTier.color : '' }}
          >
            초보자
          </span>
        </div>
        <div className={styles.labelItem} style={{ left: '50%' }}>
          <span
            className={`${styles.labelTier} ${currentTier.id === 'SKILLED' ? styles.active : ''}`}
            style={{ color: currentTier.id === 'SKILLED' ? currentTier.color : '' }}
          >
            숙련자
          </span>
        </div>
        <div className={styles.labelItem} style={{ left: '83.33%' }}>
          <span
            className={`${styles.labelTier} ${currentTier.id === 'EXPERT' ? styles.active : ''}`}
            style={{ color: currentTier.id === 'EXPERT' ? currentTier.color : '' }}
          >
            실력자
          </span>
        </div>
      </div>
    </div>
  );
}
