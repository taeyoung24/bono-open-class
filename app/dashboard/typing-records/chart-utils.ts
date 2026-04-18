export interface TypingRecord {
  id: number;
  cpm: number | null;
  accuracy: number | null;
  duration: number | null;
  type: string;
  createdAt: string;
}

/**
 * 전 과정에 대한 '나의 타수(보정 타수)' 시계열 데이터를 생성합니다.
 * 전체 기록에서 최근 10회씩 윈도우를 돌려 보정 타수(Adjusted CPM) 시계열 데이터를 생성합니다.
 */
export const calculateAdjustedCpmSeries = (records: TypingRecord[]) => {
  // 날짜 오름차순으로 정렬 (그래프는 과거 -> 미래 순)
  const sorted = [...records].sort((a, b) =>
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  return sorted.map((_, index) => {
    // 0부터 현재 인덱스까지의 윈도우 생성 (최대 최근 10개)
    const windowStart = Math.max(0, index - 9);
    const window = sorted.slice(windowStart, index + 1);

    const avgCpm = window.reduce((acc, r) => acc + (r.cpm || 0), 0) / window.length;
    const avgAcc = window.reduce((acc, r) => acc + (r.accuracy || 0), 0) / window.length;

    // accuracy가 0~1 사이 값이므로 그대로 곱함
    return Math.round(avgCpm * avgAcc);
  });
};

/**
 * 자리연습(POSITION)과 낱말연습(WORD) 기록에서 최근 10회씩 윈도우를 돌려 
 * 보정 연습 시간(Duration * (2 - Accuracy)) 시계열 데이터를 생성합니다.
 */
export const calculateDurationSeries = (records: TypingRecord[]) => {
  // 자리연습과 낱말연습 데이터만 필터링
  const filtered = records.filter(r => r.type === 'POSITION' || r.type === 'WORD');
  
  const sorted = [...filtered].sort((a, b) => 
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  return sorted.map((record, index) => {
    const windowStart = Math.max(0, index - 9);
    const window = sorted.slice(windowStart, index + 1);
    
    const avgDuration = window.reduce((acc, r) => acc + (r.duration || 0), 0) / window.length;
    const avgAcc = window.reduce((acc, r) => acc + (r.accuracy || 0), 0) / window.length;
    
    // 공식: 평균 소요 시간 * (2 - 평균 정확도)
    return Math.round(avgDuration * (2 - avgAcc));
  });
};

/**
 * 데이터를 최대 maxPoints개로 샘플링합니다.
 * 개수가 넘어가면 등분하여 각 구간의 마지막 값(종가)을 취합니다.
 */
export const sampleData = (data: number[], maxPoints: number = 16) => {
  if (data.length <= maxPoints) {
    return data.map((value, i) => ({ session: i + 1, value }));
  }

  const sampled: { session: number, value: number }[] = [];
  const step = data.length / maxPoints;

  for (let i = 1; i <= maxPoints; i++) {
    const lastIndex = Math.min(Math.floor(i * step) - 1, data.length - 1);
    sampled.push({
      session: lastIndex + 1, // 원본 회차 인덱스 표시
      value: data[lastIndex]
    });
  }

  // 마지막 포인트는 항상 가장 최신 데이터를 반영하도록 보장
  if (sampled[sampled.length - 1].session !== data.length) {
    sampled[sampled.length - 1] = {
      session: data.length,
      value: data[data.length - 1]
    };
  }

  return sampled;
};
