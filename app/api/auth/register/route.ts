import { NextResponse } from 'next/server';
import { prisma } from 'src/lib/prisma';
import bcrypt from 'bcryptjs';
import { GLOBAL_CONFIG } from 'src/settings';

export async function POST(request: Request) {
  try {
    const { userId, password, name, verificationCode } = await request.json();

    if (!userId || !password || !verificationCode) {
      return NextResponse.json(
        { field: 'userId', message: '아이디, 비밀번호, 그리고 인증코드를 모두 입력해주세요.' },
        { status: 400 }
      );
    }

    // 아이디 형식 검사
    if (!GLOBAL_CONFIG.authRegex.userId.test(userId)) {
      return NextResponse.json(
        { field: 'userId', message: '아이디 형식이 올바르지 않습니다. (4자 이상의 영문 또는 숫자)' },
        { status: 400 }
      );
    }

    // 비밀번호 형식 검사
    if (!GLOBAL_CONFIG.authRegex.password.test(password)) {
      return NextResponse.json(
        { field: 'password', message: '비밀번호 형식이 올바르지 않습니다. (영문, 숫자, 특수문자 포함 8자 이상)' },
        { status: 400 }
      );
    }

    // 중복 사용자 확인
    const existingUser = await prisma.user.findUnique({
      where: { userId },
    });

    if (existingUser) {
      return NextResponse.json(
        { field: 'userId', message: '이미 존재하는 아이디입니다.' },
        { status: 409 }
      );
    }

    // 인증코드 확인
    const record = await prisma.verificationCode.findUnique({
      where: { target_type: { target: userId, type: 'REGISTER' } }
    });

    if (!record || record.code !== verificationCode || new Date() > record.expiresAt) {
      return NextResponse.json(
        { field: 'verificationCode', message: '인증코드가 유효하지 않거나 만료되었습니다. 관리자에게 다시 요청해주세요.' },
        { status: 401 }
      );
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10);

    // 가성 이메일 자동 생성 (아이디@도메인)
    const email = `${userId}@${GLOBAL_CONFIG.emailDomain}`;

    // 사용자 생성
    const user = await prisma.user.create({
      data: {
        userId,
        email,
        password: hashedPassword,
        name: name || userId,
        role: 'STUDENT',
      },
    });

    // 사용한 인증코드 삭제
    await prisma.verificationCode.delete({
      where: { target_type: { target: userId, type: 'REGISTER' } }
    });

    return NextResponse.json(
      { message: '회원가입이 완료되었습니다.', userId: user.userId },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
