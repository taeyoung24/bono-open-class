export const formatRelativeTime = (date: Date, forceDetailedFormat: boolean = false): string => {
  const now = new Date();
  const diffInSeconds = (now.getTime() - date.getTime()) / 1000;
  const absDiff = Math.abs(diffInSeconds);
  const suffix = diffInSeconds >= 0 ? '전' : '후';

  // Rule 1: Seconds (0 ~ 29s)
  if (absDiff < 30) {
    return `${Math.floor(absDiff)}초 ${suffix}`;
  }

  // Rule 2: Minutes (30s ~ 30m)
  const minutes = Math.round(absDiff / 60);
  if (minutes <= 30) {
    return `${minutes}분 ${suffix}`;
  }

  // Rule 3: Hours (31m ~ 12h)
  const hours = Math.round(absDiff / 3600);
  if (hours <= 12) {
    return `${hours}시간 ${suffix}`;
  }

  // Rule 4: Days (13h ~ 31d, or forever if forceDetailedFormat is true)
  const days = Math.round(absDiff / 86400);
  if (days <= 31 || forceDetailedFormat) {
    return `${days}일 ${suffix}`;
  }

  // Rule 5: Long ago
  return '오래전';
};

export const formatFullDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // 0-indexed
  const day = date.getDate();

  const weekdays = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
  const weekday = weekdays[date.getDay()];

  let hour = date.getHours();
  const ampm = hour >= 12 ? '오후' : '오전';

  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  const minute = date.getMinutes();

  // "2026년 1월 29일 월요일 오후 5시 19분"
  return `${year}년 ${month}월 ${day}일 ${weekday} ${ampm} ${displayHour}시 ${minute}분`;
};

export const formatDuration = (seconds: number): string => {
  if (seconds < 60) return `${seconds}초봉`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}분봉`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}시간봉`;
  return `${Math.floor(seconds / 86400)}일봉`;
};
