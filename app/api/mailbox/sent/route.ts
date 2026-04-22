import { NextResponse } from 'next/server';
import { prisma } from 'src/lib/prisma';
import { logger } from 'src/utils/log';

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

    // 보낸 메일 목록 조회 (발신인 기준)
    const sent = await prisma.mail.findMany({
      where: {
        senderId: userId,
        deletedBySender: false,
      },
      include: {
        sender: {
          select: {
            name: true,
            email: true,
          },
        },
        receiver: {
          select: {
            name: true,
            email: true,
          },
        },
        attachments: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ sent }, { status: 200 });
  } catch (error) {
    logger.e(`Mailbox sent error: ${error}`);
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
