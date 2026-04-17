import { NextResponse } from 'next/server';
import { prisma } from 'src/lib/prisma';

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { mailIds, userId } = body;

    if (!mailIds || !Array.isArray(mailIds) || mailIds.length === 0) {
      return NextResponse.json(
        { message: '삭제할 메일이 선택되지 않았습니다.' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { message: '사용자 정보가 필요합니다.' },
        { status: 400 }
      );
    }

    // 1. 발신자인 경우의 삭제 플래그 업데이트
    await prisma.mail.updateMany({
      where: {
        id: { in: mailIds },
        senderId: userId
      },
      data: { deletedBySender: true }
    });

    // 2. 수신자인 경우의 삭제 플래그 업데이트
    await prisma.mail.updateMany({
      where: {
        id: { in: mailIds },
        receiverId: userId
      },
      data: { deletedByReceiver: true }
    });

    // 3. 양측 모두 삭제 처리된 메일은 DB에서 물리적으로 삭제 (공간 최적화)
    await prisma.mail.deleteMany({
      where: {
        id: { in: mailIds },
        deletedBySender: true,
        deletedByReceiver: true
      }
    });

    return NextResponse.json({ message: '성공적으로 삭제되었습니다.' }, { status: 200 });
  } catch (error) {
    console.error('Mail deletion error:', error);
    return NextResponse.json(
      { message: '메일 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
