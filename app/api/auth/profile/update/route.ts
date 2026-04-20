import { NextResponse } from 'next/server';
import { prisma } from 'src/lib/prisma';
import { logger } from 'src/utils/log';

export async function POST(request: Request) {
  try {
    const { userId, name } = await request.json();

    if (!userId || !name) {
      return NextResponse.json(
        { message: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // 사용자 정보 업데이트
    const updatedUser = await prisma.user.update({
      where: { userId },
      data: { name },
    });

    return NextResponse.json({
      message: '성공적으로 수정되었습니다.',
      user: {
        userId: updatedUser.userId,
        name: updatedUser.name,
      },
    }, { status: 200 });
  } catch (error) {
    logger.e(`Profile update error: ${error}`);
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
