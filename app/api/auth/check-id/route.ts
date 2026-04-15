import { NextResponse } from 'next/server';
import { prisma } from 'src/lib/prisma';

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { message: '아이디를 입력해주세요.' },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { userId },
    });

    if (existingUser) {
      return NextResponse.json(
        { available: false, message: '이미 사용 중인 아이디입니다.' },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { available: true, message: '사용 가능한 아이디입니다.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('ID Check error:', error);
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
