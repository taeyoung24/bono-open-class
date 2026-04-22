'use client';

import { useMemo } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { TypingRecord } from 'src/types';
import {
  calculateAdjustedCpmSeries,
  calculateDurationSeries,
  sampleData
} from './chart-utils';

interface TypingHistoryChartProps {
  records: TypingRecord[];
  mode?: 'cpm' | 'duration';
}

export default function TypingHistoryChart({ records, mode = 'cpm' }: TypingHistoryChartProps) {
  // 시간(초)을 n분 n초로 변환하는 유틸리티
  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return min > 0 ? `${min}분 ${sec}초` : `${sec}초`;
  };

  const chartData = useMemo(() => {
    if (!records || records.length === 0) return [];

    // 모드에 따라 계산 로직 선택
    const fullSeries = mode === 'cpm'
      ? calculateAdjustedCpmSeries(records)
      : calculateDurationSeries(records);

    // 2. 최대 16개 포인트로 샘플링
    const sampled = sampleData(fullSeries, 16);

    return sampled;
  }, [records, mode]);

  if (chartData.length === 0) {
    return null;
  }

  // 세로 스크롤이 발생하더라도 그래프가 찌그러지지 않도록 충분한 고정 높이를 제공합니다.
  return (
    <div style={{ width: '100%', height: 320, marginTop: '16px', outline: 'none', userSelect: 'none', WebkitTapHighlightColor: 'transparent' }}>
      <ResponsiveContainer width="100%" height="100%" style={{ outline: 'none' }}>
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
          style={{ outline: 'none' }}
          accessibilityLayer={false}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="var(--bg-input)"
          />
          <XAxis
            dataKey="session"
            hide={true} // 회차 텍스트는 숨겨서 깔끔하게 유지
          />
          <YAxis
            tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
            axisLine={false}
            tickLine={false}
            domain={['dataMin - 50', 'dataMax + 50']}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 'var(--radius-sm)',
              border: 'var(--border-width) solid var(--border-main)',
              fontSize: 'var(--font-size-base)',
              fontWeight: 'var(--font-weight-sb)'
            }}
            labelFormatter={(value) => `${value}회차`}
            formatter={(value: any) => [
              mode === 'cpm' ? `CPM: ${value}타` : `보정 시간: ${formatTime(value)}`
            ]}
          />
          <Line
            type="linear"
            dataKey="value"
            stroke="var(--accent-primary)"
            strokeWidth={3}
            dot={{ r: 5, fill: 'var(--accent-primary)', strokeWidth: 0 }}
            activeDot={{ r: 7, strokeWidth: 0 }}
            animationDuration={1000}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
