import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import { prisma } from 'src/lib/prisma';
import { logger } from 'src/utils/log';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';

export async function POST(request: Request) {
  try {
    const { userId, password } = await request.json();

    if (!userId || !password) {
      return NextResponse.json(
        { message: '아이디와 비밀번호를 입력해주세요.' },
        { status: 400 }
      );
    }

    // 사용자 조회
    const user = await prisma.user.findUnique({
      where: { userId },
    });

    if (!user) {
      return NextResponse.json(
        { message: '존재하지 않는 사용자입니다.' },
        { status: 401 }
      );
    }

    // 비밀번호 확인
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { message: '비밀번호가 일치하지 않습니다.' },
        { status: 401 }
      );
    }

    // 토큰 생성
    const token = jwt.sign(
      {
        id: user.id,
        userId: user.userId,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    // 응답 구성 (보안을 위해 비밀번호 제외)
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      {
        message: '로그인 성공',
        token,
        user: userWithoutPassword
      },
      { status: 200 }
    );
  } catch (error) {
    logger.e(`Login error: ${error}`);
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
