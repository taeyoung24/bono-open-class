import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import { logger } from 'src/utils/log';
import { AuthUser } from 'src/types';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';

export async function verifyAuth(request: Request): Promise<AuthUser | null> {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;

    return decoded;
  } catch (error) {
    logger.e(`JWT verification failed: ${error}`);
    return null;
  }
}

export function unauthorizedResponse() {
  return NextResponse.json(
    { message: '인증이 필요하거나 유효하지 않은 토큰입니다.' },
    { status: 401 }
  );
}
