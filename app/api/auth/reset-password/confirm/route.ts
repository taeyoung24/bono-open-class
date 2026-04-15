import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { prisma } from 'src/lib/prisma';

export async function POST(request: Request) {
  try {
    const { userId, code, newPassword } = await request.json();

    if (!userId || !code || !newPassword) {
      return NextResponse.json({ message: '필수 정보가 누락되었습니다.' }, { status: 400 });
    }

    // 코드 재검증 (직접 confirm URL 호출하는 경우 방지)
    const record = await prisma.passwordResetCode.findUnique({ where: { userId } });
    if (!record || record.code !== code || new Date() > record.expiresAt) {
      return NextResponse.json({ message: '유효하지 않은 인증 정보입니다.' }, { status: 401 });
    }

    // 비밀번호 유효성 재확인
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return NextResponse.json(
        { message: '비밀번호는 영문, 숫자, 특수문자를 포함하여 8자 이상이어야 합니다.' },
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
    await prisma.passwordResetCode.delete({ where: { userId } });

    return NextResponse.json({ message: '비밀번호가 성공적으로 변경되었습니다.' }, { status: 200 });
  } catch (error) {
    console.error('Reset confirm error:', error);
    return NextResponse.json({ message: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
