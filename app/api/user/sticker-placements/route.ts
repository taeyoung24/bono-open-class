import { NextResponse } from 'next/server';
import { prisma } from 'src/lib/prisma';
import { logger } from 'src/utils/log';

// 배치된 스티커 목록 조회
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const pageIdStr = searchParams.get('pageId');
    const all = searchParams.get('all') === 'true';

    if (!userId && !pageIdStr) {
      return NextResponse.json({ message: '사용자 아이디 또는 페이지 아이디가 필요합니다.' }, { status: 400 });
    }

    let queryWhere: any = {};

    if (all && userId) {
      // 모든 페이지의 배치 정보 조회
      const userPages = await prisma.stickerPage.findMany({
        where: { userId },
        select: { id: true }
      });
      queryWhere = { pageId: { in: userPages.map(p => p.id) } };
    } else if (pageIdStr) {
      queryWhere = { pageId: parseInt(pageIdStr) };
    } else {
      // userId로 첫 번째 페이지 찾기
      let page = await prisma.stickerPage.findFirst({
        where: { userId: userId!, pageNumber: 1 }
      });

      if (!page) {
        page = await prisma.stickerPage.create({
          data: { userId: userId!, pageNumber: 1, title: '첫 번째 페이지' }
        });
      }
      queryWhere = { pageId: page.id };
    }

    const placements = await prisma.userStickerPlacement.findMany({
      where: queryWhere,
      include: { item: true },
      orderBy: { placedAt: 'asc' },
    });

    const result = placements.map(p => ({
      id: p.id,
      itemId: p.itemId,
      pageId: p.pageId,
      name: p.item.name,
      imageUrl: p.item.imageUrl,
      x: p.x,
      y: p.y,
      rotation: p.rotation,
    }));

    return NextResponse.json({ 
      placements: result, 
      ...(typeof queryWhere.pageId === 'number' && { pageId: queryWhere.pageId }) 
    }, { status: 200 });
  } catch (error) {
    logger.e(`Fetch sticker placements error: ${error}`);
    return NextResponse.json({ message: '배치 정보를 불러오는 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

// 스티커 새 배치
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, itemId, x, y, rotation = 0, pageId: bodyPageId } = body;

    if (!userId || !itemId || x === undefined || y === undefined) {
      return NextResponse.json({ message: '필수 데이터가 누락되었습니다.' }, { status: 400 });
    }

    let targetPageId: number;

    if (bodyPageId) {
      targetPageId = bodyPageId;
    } else {
      // 사용자의 첫 번째 페이지를 찾거나 없으면 생성
      let page = await prisma.stickerPage.findFirst({
        where: { userId, pageNumber: 1 }
      });

      if (!page) {
        page = await prisma.stickerPage.create({
          data: { userId, pageNumber: 1, title: '첫 번째 페이지' }
        });
      }
      targetPageId = page.id;
    }

    // 해당 페이지의 현재 스티커 개수 확인 (최대 30개 제한)
    const currentCount = await prisma.userStickerPlacement.count({
      where: { pageId: targetPageId }
    });

    if (currentCount >= 30) {
      return NextResponse.json({ message: '해당 페이지가 가득 찼습니다(최대 30개). 다음 페이지를 이용해 주세요.' }, { status: 400 });
    }

    // 트랜잭션: 스티커 배치 기록 생성 + 인벤토리 수량 감소
    const result = await prisma.$transaction(async (tx) => {
      // 1. 배치 생성
      const placement = await tx.userStickerPlacement.create({
        data: { 
          pageId: targetPageId, 
          itemId, 
          x, 
          y, 
          rotation 
        },
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
