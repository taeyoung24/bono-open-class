import { NextResponse } from 'next/server';
import { prisma } from 'src/lib/prisma';
import { verifyAuth, unauthorizedResponse } from 'src/utils/auth';
import { logger } from 'src/utils/log';

export async function GET(request: Request) {
  try {
    const user = await verifyAuth(request);
    // 미들웨어에서도 체크하지만 API 레벨에서도 보안을 위해 한 번 더 체크
    if (!user || user.role !== 'TEACHER') {
      return unauthorizedResponse();
    }

    const users = await prisma.user.findMany({
      select: {
        userId: true,
        name: true,
        nickname: true,
        profileImage: true,
        role: true,
        updatedAt: true,
      },
      orderBy: [
        { updatedAt: 'desc' },
        { name: 'asc' },
      ],
    });

    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    logger.e(`Fetch users error: ${error}`);
    return NextResponse.json(
      { message: '사용자 목록을 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
