import { NextResponse } from 'next/server';
import { prisma } from 'src/lib/prisma';
import { GLOBAL_CONFIG } from 'src/settings';
import { Logger } from 'src/utils/log';

const logger = new Logger('register-verification');

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ message: '아이디를 먼저 입력해주세요.' }, { status: 400 });
    }

    // 아이디 형식 검사
    if (!GLOBAL_CONFIG.authRegex.userId.test(userId)) {
      return NextResponse.json({ message: '아이디 형식이 올바르지 않습니다.' }, { status: 400 });
    }

    // 중복 확인
    const existingUser = await prisma.user.findUnique({ where: { userId } });
    if (existingUser) {
      return NextResponse.json({ message: '이미 가입된 아이디입니다.' }, { status: 409 });
    }

    // 4자리 인증코드 생성
    const code = String(Math.floor(1000 + Math.random() * 9000));
    const expiryMinutes = GLOBAL_CONFIG.registrationExpiryMinutes;
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

    // DB 저장 (VerificationCode 모델 사용)
    await prisma.verificationCode.upsert({
      where: { target_type: { target: userId, type: 'REGISTER' } },
      update: { code, expiresAt },
      create: { target: userId, type: 'REGISTER', code, expiresAt },
    });

    // 선생님 알림
    await logger.reportAsync(
      `**[신규 가입 요청]**\n\`아이디\`: \`${userId}\`\n\`인증코드\`: **${code}** (${expiryMinutes}분 유효)\n\n학생에게 이 코드를 알려주세요.`,
      true
    );

    return NextResponse.json({ message: '가입 인증코드가 선생님에게 요청되었습니다.' }, { status: 200 });
  } catch (error) {
    logger.e(`Register code request error: ${error}`);
    return NextResponse.json({ message: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
