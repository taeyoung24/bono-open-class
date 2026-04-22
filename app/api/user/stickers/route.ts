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

    // 사용자의 인벤토리에서 스티커 타입인 것들을 조회
    const inventoryItems = await prisma.userInventory.findMany({
      where: {
        userId: userId,
        item: {
          type: 'STICKER'
        }
      },
      include: {
        item: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // 프론트엔드에서 사용하기 편한 형태로 가공
    const stickers = inventoryItems.map(ui => ({
      inventoryId: ui.id,
      itemId: ui.item.id,
      name: ui.item.name,
      imageUrl: ui.item.imageUrl,
      quantity: ui.quantity
    }));

    return NextResponse.json({ stickers }, { status: 200 });
  } catch (error) {
    logger.e(`Fetch user stickers error: ${error}`);
    return NextResponse.json(
      { message: '스티커 목록을 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
