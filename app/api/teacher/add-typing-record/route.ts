import { NextResponse } from 'next/server';
import { prisma } from 'src/lib/prisma';
import { logger } from 'src/utils/log';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, cpm, accuracy, duration, type } = body;

    // 필수 필드 검증
    if (!userId || cpm === undefined || accuracy === undefined) {
      return NextResponse.json({ message: '필수 정보를 모두 입력해주세요.' }, { status: 400 });
    }

    // 대상 유저 존재 확인
    const user = await prisma.user.findUnique({
      where: { userId }
    });

    if (!user) {
      return NextResponse.json({ message: '존재하지 않는 학생입니다.' }, { status: 404 });
    }

    // 정확도 유효성 검사 및 변환 (백분율 -> 소수점)
    const accuracyValue = parseFloat(accuracy.toString()) / 100;
    if (accuracyValue < 0 || accuracyValue > 1) {
      return NextResponse.json({ message: '정확도는 0%에서 100% 사이여야 합니다.' }, { status: 400 });
    }

    // 타자 기록 생성
    const newRecord = await prisma.typingRecord.create({
      data: {
        userId,
        cpm: parseInt(cpm.toString()),
        accuracy: accuracyValue,
        duration: parseInt((duration || 0).toString()),
        type: type || 'NORMAL',
      }
    });

    return NextResponse.json({ 
      message: '기록이 성공적으로 추가되었습니다.',
      record: newRecord 
    }, { status: 201 });

  } catch (error) {
    logger.e(`Failed to add typing record: ${error}`);
    return NextResponse.json({ message: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
