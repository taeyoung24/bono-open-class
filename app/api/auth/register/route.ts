import { NextResponse } from 'next/server';
import { prisma } from 'src/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { userId, password, name } = await request.json();

    if (!userId || !password) {
      return NextResponse.json(
        { message: '아이디와 비밀번호를 입력해주세요.' },
        { status: 400 }
      );
    }

    // 중복 사용자 확인
    const existingUser = await prisma.user.findUnique({
      where: { userId },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: '이미 존재하는 아이디입니다.' },
        { status: 409 }
      );
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10);

    // 사용자 생성
    const user = await prisma.user.create({
      data: {
        userId,
        password: hashedPassword,
        name: name || userId,
        role: 'STUDENT',
      },
    });

    return NextResponse.json(
      { message: '회원가입이 완료되었습니다.', userId: user.userId },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
