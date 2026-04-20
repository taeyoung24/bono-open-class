import { NextResponse } from 'next/server';
import { prisma } from 'src/lib/prisma';
import { logger } from 'src/utils/log';

export async function POST(request: Request) {
  try {
    const { userId, code } = await request.json();

    if (!userId || !code) {
      return NextResponse.json({ message: '아이디와 인증코드를 입력해주세요.' }, { status: 400 });
    }

    const record = await prisma.verificationCode.findUnique({
      where: { target_type: { target: userId, type: 'PASSWORD_RESET' } }
    });

    if (!record) {
      return NextResponse.json({ message: '인증코드 요청 내역이 없습니다.' }, { status: 404 });
    }

    if (new Date() > record.expiresAt) {
      await prisma.verificationCode.delete({
        where: { target_type: { target: userId, type: 'PASSWORD_RESET' } }
      });
      return NextResponse.json({ message: '인증코드가 만료되었습니다. 다시 요청해주세요.' }, { status: 410 });
    }

    if (record.code !== code) {
      return NextResponse.json({ message: '인증코드가 올바르지 않습니다.' }, { status: 401 });
    }

    return NextResponse.json({ message: '인증 성공. 새 비밀번호를 입력해주세요.' }, { status: 200 });
  } catch (error) {
    logger.e(`Reset verify error: ${error}`);
    return NextResponse.json({ message: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
