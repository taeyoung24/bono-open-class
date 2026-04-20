import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { prisma } from 'src/lib/prisma';
import { GLOBAL_CONFIG } from 'src/settings';
import { logger } from 'src/utils/log';

export async function POST(request: Request) {
  try {
    const { userId, code, newPassword } = await request.json();

    if (!userId || !code || !newPassword) {
      return NextResponse.json({ message: '필수 정보가 누락되었습니다.' }, { status: 400 });
    }

    // 코드 재검증 (직접 confirm URL 호출하는 경우 방지)
    const record = await prisma.verificationCode.findUnique({
      where: { target_type: { target: userId, type: 'PASSWORD_RESET' } }
    });
    if (!record || record.code !== code || new Date() > record.expiresAt) {
      return NextResponse.json({ message: '유효하지 않은 인증 정보입니다.' }, { status: 401 });
    }

    // 비밀번호 유효성 재확인
    const passwordRegex = GLOBAL_CONFIG.authRegex.password;
    if (!passwordRegex.test(newPassword)) {
      return NextResponse.json(
        { message: '비밀번호 형식이 올바르지 않습니다. (영문, 숫자, 특수문자 포함 8자 이상)' },
        { status: 400 }
      );
    }

    // 비밀번호 변경
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { userId },
      data: { password: hashedPassword },
    });

    // 사용한 인증코드 삭제
    await prisma.verificationCode.delete({
      where: { target_type: { target: userId, type: 'PASSWORD_RESET' } }
    });

    return NextResponse.json({ message: '비밀번호가 성공적으로 변경되었습니다.' }, { status: 200 });
  } catch (error) {
    logger.e(`Reset confirm error: ${error}`);
    return NextResponse.json({ message: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
