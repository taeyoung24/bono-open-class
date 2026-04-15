import { NextResponse } from 'next/server';
import { prisma } from 'src/lib/prisma';
import { GLOBAL_CONFIG } from 'src/settings';
import { Logger } from 'src/utils/log';

const logger = new Logger('reset-password');

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ message: '아이디를 입력해주세요.' }, { status: 400 });
    }

    // 사용자 존재 확인
    const user = await prisma.user.findUnique({ where: { userId } });
    if (!user) {
      return NextResponse.json({ message: '존재하지 않는 아이디입니다.' }, { status: 404 });
    }

    // 4자리 인증코드 생성
    const code = String(Math.floor(1000 + Math.random() * 9000));
    const expiryMinutes = GLOBAL_CONFIG.passwordResetExpiryMinutes;
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

    // DB에 upsert (이미 있으면 덮어씀)
    await prisma.passwordResetCode.upsert({
      where: { userId },
      update: { code, expiresAt },
      create: { userId, code, expiresAt },
    });

    // logger.ac() → CRITICAL 레벨 → 자동으로 관리자 멘션 포함하여 디스코드 전송
    await logger.ac(
      `**비밀번호 재설정 요청**\n\`아이디\`: \`${userId}\`\n\`이름\`: ${user.name}\n\`인증코드\`: **${code}** (${expiryMinutes}분 유효)\n\n사용자에게 이 코드를 전달해주세요.`
    );

    return NextResponse.json({ message: '인증코드가 관리자에게 전송되었습니다.' }, { status: 200 });
  } catch (error) {
    logger.e(`Reset request error: ${error}`);
    return NextResponse.json({ message: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
