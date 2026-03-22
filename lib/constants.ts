export const BADGE_GRADES = {
  1: { label: '입문', stars: '★' },
  2: { label: '초급', stars: '★★' },
  3: { label: '중급', stars: '★★★' },
  4: { label: '상급', stars: '★★★★' },
  5: { label: '전문', stars: '★★★★★' },
} as const;

// 타입스크립트 자동완성을 위한 타입 추출 (1 | 2 | 3 | 4 | 5)
export type BadgeGrade = keyof typeof BADGE_GRADES;
