import { NextResponse } from 'next/server';
import { prisma } from 'src/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { message: '사용자 아이디가 필요합니다.' },
        { status: 400 }
      );
    }

    // 받은 메일 목록 조회 (수신인 기준)
    const inbox = await prisma.mail.findMany({
      where: {
        receiverId: userId,
        deletedByReceiver: false,
      },
      include: {
        sender: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ inbox }, { status: 200 });
  } catch (error) {
    console.error('Mailbox inbox error:', error);
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
