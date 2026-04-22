import { NextResponse } from 'next/server';
import { prisma } from 'src/lib/prisma';
import { verifyAuth, unauthorizedResponse } from 'src/utils/auth';
import { logger } from 'src/utils/log';

export async function GET(request: Request) {
  try {
    const user = await verifyAuth(request);
    if (!user || user.role !== 'TEACHER') {
      return unauthorizedResponse();
    }

    const stickers = await prisma.item.findMany({
      where: { type: 'STICKER' },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ stickers }, { status: 200 });
  } catch (error) {
    logger.e(`Fetch stickers error: ${error}`);
    return NextResponse.json(
      { message: '스티커 목록을 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
