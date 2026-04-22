import { NextResponse } from 'next/server';
import { prisma } from 'src/lib/prisma';
import { Logger } from 'src/utils/log';

const logger = new Logger('typing-delete');

export async function POST(request: Request) {
  try {
    const { userId, recordId } = await request.json();

    if (!userId || !recordId) {
      return NextResponse.json({ message: '필수 정보가 누락되었습니다.' }, { status: 400 });
    }

    // 사용자 및 기록 확인
    const [user, record] = await Promise.all([
      prisma.user.findUnique({ where: { userId } }),
      prisma.typingRecord.findUnique({ where: { id: recordId } })
    ]);

    if (!user || !record) {
      return NextResponse.json({ message: '사용자 또는 기록을 찾을 수 없습니다.' }, { status: 404 });
    }

    // 4자리 인증코드 생성
    const code = String(Math.floor(1000 + Math.random() * 9000));
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10분 유효

    // DB 저장 (upsert)
    await prisma.verificationCode.upsert({
      where: { target_type: { target: userId, type: 'RECORD_DELETE' } },
      update: { code, expiresAt },
      create: { target: userId, type: 'RECORD_DELETE', code, expiresAt },
    });

    // 선생님에게 보고
    await logger.reportAsync(
      `**타자 연습 기록 삭제 요청**\n\`아이디\`: \`${userId}\`\n\`이름\`: ${user.name}\n\`삭제 대상 기록 ID\`: ${recordId}\n\`인증코드\`: **${code}** (10분 유효)\n\n학생의 요청이 맞다면 이 코드를 안내해주세요.`,
      true
    );

    return NextResponse.json({ message: '삭제 승인 코드가 선생님에게 전송되었습니다.' }, { status: 200 });
  } catch (error) {
    logger.e(`Delete request error: ${error}`);
    return NextResponse.json({ message: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
