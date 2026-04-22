import { NextResponse } from 'next/server';
import { prisma } from 'src/lib/prisma';
import { Logger } from 'src/utils/log';

const logger = new Logger('typing-delete');

export async function POST(request: Request) {
  try {
    const { userId, recordId, code } = await request.json();

    if (!userId || !recordId || !code) {
      return NextResponse.json({ message: '인증 정보가 부족합니다.' }, { status: 400 });
    }

    // 인증 코드 확인
    const verification = await prisma.verificationCode.findUnique({
      where: { target_type: { target: userId, type: 'RECORD_DELETE' } }
    });

    if (!verification || verification.code !== code) {
      return NextResponse.json({ message: '인증 코드가 일치하지 않습니다.' }, { status: 400 });
    }

    if (new Date() > verification.expiresAt) {
      return NextResponse.json({ message: '인증 코드가 만료되었습니다. 다시 요청해주세요.' }, { status: 400 });
    }

    // 기록 삭제 실행
    await prisma.typingRecord.delete({
      where: { id: recordId }
    });

    // 사용된 인증 코드 삭제 (재사용 방지)
    await prisma.verificationCode.delete({
      where: { id: verification.id }
    });

    logger.i(`Record ${recordId} deleted by user ${userId}`);

    return NextResponse.json({ message: '기록이 삭제되었습니다.' }, { status: 200 });
  } catch (error) {
    logger.e(`Delete confirm error: ${error}`);
    return NextResponse.json({ message: '기록 삭제 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
