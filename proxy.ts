import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 허용되는 공개 라우트
  const publicPaths = ['/login', '/register', '/reset-password', '/about'];

  // 루트 경로나 공개 경로인지 확인 (혹은 API 라우트인 경우)
  if (
    pathname === '/' ||
    publicPaths.some((path) => pathname.startsWith(path)) ||
    pathname.startsWith('/api')
  ) {
    return NextResponse.next();
  }

  // 로그인 토큰 (쿠키) 확인
  const token = request.cookies.get('auth_token')?.value;

  if (!token) {
    // 토큰이 없으면 로그인 페이지로 리다이렉트
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    
    const response = NextResponse.redirect(url);
    
    // 브라우저 캐시 방지 헤더 추가 (매번 서버의 확인을 거치도록 강제)
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
