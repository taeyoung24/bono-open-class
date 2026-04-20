import { UserProfile } from 'src/types';

/**
 * 사용자 객체를 전달받아 화면에 표시할 이름을 결정합니다.
 * 우선순위: 닉네임(nickname) > 아이디(userId) > 기본값('무명')
 */
export function getUserDisplayName(user: Partial<UserProfile> | null | undefined): string {
  if (!user) return '무명';
  return user.nickname || user.userId || '무명';
}
