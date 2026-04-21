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

    // 사용자의 모든 인벤토리 아이템 조회
    const inventoryItems = await prisma.userInventory.findMany({
      where: {
        userId: userId,
      },
      include: {
        item: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // 프론트엔드에서 사용하기 편한 형태로 가공
    const items = inventoryItems.map(ui => ({
      inventoryId: ui.id,
      itemId: ui.item.id,
      name: ui.item.name,
      description: ui.item.description,
      imageUrl: ui.item.imageUrl,
      type: ui.item.type,
      quantity: ui.quantity,
      acquiredAt: ui.createdAt
    }));

    return NextResponse.json({ items }, { status: 200 });
  } catch (error) {
    logger.e(`Fetch user inventory error: ${error}`);
    return NextResponse.json(
      { message: '인벤토리 목록을 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
