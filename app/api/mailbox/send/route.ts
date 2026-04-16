import { NextResponse } from 'next/server';
import { prisma } from 'src/lib/prisma';

export async function POST(request: Request) {
  try {
    const { senderId, receiverEmail, title, content } = await request.json();

    if (!senderId || !receiverEmail || !title || !content) {
      return NextResponse.json(
        { message: '모든 필드를 입력해야 합니다.' },
        { status: 400 }
      );
    }

    // 수신자가 존재하는지 확인 (이메일 기준)
    const receiver = await prisma.user.findUnique({
      where: { email: receiverEmail },
    });

    if (!receiver) {
      return NextResponse.json(
        { message: '수신자를 찾을 수 없습니다. 이메일 주소를 확인해주세요.' },
        { status: 404 }
      );
    }

    // 메일 생성
    const newMail = await prisma.mail.create({
      data: {
        senderId,
        receiverId: receiver.userId, // receiverEmail로 찾은 유저의 userId를 DB에 저장
        title,
        content,
      },
    });

    return NextResponse.json(
      { message: '메일이 전송되었습니다.', mail: newMail },
      { status: 201 }
    );
  } catch (error) {
    console.error('Mail send error:', error);
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
