import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. 허용되는 공개 라우트 (비로그인 상태 접근 가능)
  const publicPaths = ['/login', '/register', '/reset-password', '/about'];

  // 루트 경로(/)나 공개 경로, 혹은 API 라우트인 경우 통과
  if (
    pathname === '/' ||
    publicPaths.some((path) => pathname.startsWith(path)) ||
    pathname.startsWith('/api')
  ) {
    return NextResponse.next();
  }

  // 2. 로그인 토큰 (쿠키) 확인
  const token = request.cookies.get('auth_token')?.value;

  if (!token) {
    // 토큰이 없으면 로그인 페이지로 리다이렉트
    const url = request.nextUrl.clone();
    url.pathname = '/login';

    const response = NextResponse.redirect(url);

    // 브라우저 캐시 방지 헤더 추가
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;
  }

  // 3. 선생님 전용 경로 보호 (/dashboard/teacher/*, /api/teacher/*)
  const isTeacherPath = pathname.startsWith('/dashboard/teacher');
  const isTeacherApi = pathname.startsWith('/api/teacher');

  if (isTeacherPath || isTeacherApi) {
    try {
      // JWT 페이로드 디코딩 (역할 확인)
      const payloadBase64 = token.split('.')[1];
      const payloadJson = Buffer.from(payloadBase64, 'base64').toString();
      const payload = JSON.parse(payloadJson);

      if (payload.role !== 'TEACHER') {
        // API 요청인 경우 403 에러 반환
        if (isTeacherApi) {
          return NextResponse.json(
            { message: '선생님 권한이 필요한 기능입니다.' },
            { status: 403 }
          );
        }
        // 페이지 요청인 경우 일반 대쉬보드로 리다이렉트
        const url = request.nextUrl.clone();
        url.pathname = '/dashboard';
        return NextResponse.redirect(url);
      }
    } catch (e) {
      // 디코딩 실패 시 세션 만료로 간주
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * 아래 경로들을 제외한 모든 경로에 프록시 적용:
     * - api (API 라우트)
     * - _next/static (정적 파일)
     * - _next/image (이미지 최적화 파일)
     * - favicon.ico (파비콘)
     * - 이미지/미디어 확장자들
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
