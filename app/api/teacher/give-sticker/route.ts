import { NextResponse } from 'next/server';
import { prisma } from 'src/lib/prisma';
import { verifyAuth, unauthorizedResponse } from 'src/utils/auth';
import { logger } from 'src/utils/log';

export async function POST(request: Request) {
  try {
    const teacher = await verifyAuth(request);
    if (!teacher || teacher.role !== 'TEACHER') {
      return unauthorizedResponse();
    }

    const { targetUserId, itemId, quantity } = await request.json();

    if (!targetUserId || !itemId || !quantity || quantity <= 0) {
      return NextResponse.json(
        { message: '필수 데이터가 누락되었거나 올바르지 않습니다.' },
        { status: 400 }
      );
    }

    // 인벤토리 업데이트 (이미 있으면 수량 추가, 없으면 생성)
    await prisma.userInventory.upsert({
      where: {
        userId_itemId: {
          userId: targetUserId,
          itemId: itemId,
        },
      },
      update: {
        quantity: { increment: quantity },
      },
      create: {
        userId: targetUserId,
        itemId: itemId,
        quantity: quantity,
      },
    });

    const targetUser = await prisma.user.findUnique({
      where: { userId: targetUserId },
      select: { name: true }
    });

    const sticker = await prisma.item.findUnique({
      where: { id: itemId },
      select: { name: true }
    });

    logger.ai(`Teacher ${teacher.userId} gave ${quantity} ${sticker?.name} to ${targetUserId}(${targetUser?.name})`);

    return NextResponse.json(
      { message: `${targetUser?.name || targetUserId} 학생에게 ${sticker?.name} ${quantity}개를 지급했습니다.` },
      { status: 200 }
    );
  } catch (error) {
    logger.e(`Give sticker error: ${error}`);
    return NextResponse.json(
      { message: '스티커 지급 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
