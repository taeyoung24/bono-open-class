import { NextResponse } from 'next/server';
import { prisma } from 'src/lib/prisma';
import { logger } from 'src/utils/log';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { message: '사용자 아이디가 필요합니다.' },
        { status: 400 }
      );
    }

    // 해당 사용자의 모든 타자 연습 기록 조회
    const records = await prisma.typingRecord.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // 간단한 통계 계산
    const totalCount = records.length;
    const avgCpm = totalCount > 0
      ? Math.round(records.reduce((acc, curr) => acc + (curr.cpm || 0), 0) / totalCount)
      : 0;
    const avgAccuracy = totalCount > 0
      ? (records.reduce((acc, curr) => acc + (curr.accuracy || 0), 0) / totalCount).toFixed(1)
      : '0';

    return NextResponse.json({
      records,
      stats: {
        totalCount,
        avgCpm,
        avgAccuracy: parseFloat(avgAccuracy)
      }
    }, { status: 200 });
  } catch (error) {
    logger.e(`Fetch typing records error: ${error}`);
    return NextResponse.json(
      { message: '기록을 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
