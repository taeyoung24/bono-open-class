import { NextResponse } from 'next/server';
import { prisma } from 'src/lib/prisma';
import { logger } from 'src/utils/log';

// 배치된 스티커 목록 조회
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ message: '사용자 아이디가 필요합니다.' }, { status: 400 });
    }

    const placements = await prisma.userStickerPlacement.findMany({
      where: { userId },
      include: { item: true },
      orderBy: { placedAt: 'asc' },
    });

    const result = placements.map(p => ({
      id: p.id,
      itemId: p.itemId,
      name: p.item.name,
      imageUrl: p.item.imageUrl,
      x: p.x,
      y: p.y,
      rotation: p.rotation,
    }));

    return NextResponse.json({ placements: result }, { status: 200 });
  } catch (error) {
    logger.e(`Fetch sticker placements error: ${error}`);
    return NextResponse.json({ message: '배치 정보를 불러오는 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

// 스티커 새 배치
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, itemId, x, y, rotation = 0 } = body;

    if (!userId || !itemId || x === undefined || y === undefined) {
      return NextResponse.json({ message: '필수 데이터가 누락되었습니다.' }, { status: 400 });
    }

    // 트랜잭션: 스티커 배치 기록 생성 + 인벤토리 수량 감소
    const result = await prisma.$transaction(async (tx) => {
      // 1. 배치 생성
      const placement = await tx.userStickerPlacement.create({
        data: { userId, itemId, x, y, rotation },
        include: { item: true },
      });

      // 2. 인벤토리 조회
      const inventory = await tx.userInventory.findUnique({
        where: {
          userId_itemId: { userId, itemId }
        }
      });

      if (!inventory) {
        throw new Error('인벤토리에 해당 아이템이 없습니다.');
      }

      if (inventory.quantity > 1) {
        // 수량이 1보다 크면 감소
        await tx.userInventory.update({
          where: { id: inventory.id },
          data: { quantity: { decrement: 1 } }
        });
      } else {
        // 수량이 1이면 삭제
        await tx.userInventory.delete({
          where: { id: inventory.id }
        });
      }

      return placement;
    });

    return NextResponse.json({
      placement: {
        id: result.id,
        itemId: result.itemId,
        name: result.item.name,
        imageUrl: result.item.imageUrl,
        x: result.x,
        y: result.y,
        rotation: result.rotation,
      }
    }, { status: 201 });
  } catch (error) {
    logger.e(`Create sticker placement error: ${error}`);
    return NextResponse.json({ message: error instanceof Error ? error.message : '스티커 배치 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
