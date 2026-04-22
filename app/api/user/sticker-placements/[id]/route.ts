import { NextResponse } from 'next/server';
import { prisma } from 'src/lib/prisma';
import { logger } from 'src/utils/log';

// 스티커 위치 이동
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params;
    const id = parseInt(rawId);
    const body = await request.json();
    const { x, y, rotation } = body;

    if (isNaN(id) || x === undefined || y === undefined) {
      return NextResponse.json({ message: '올바르지 않은 요청입니다.' }, { status: 400 });
    }

    const updated = await prisma.userStickerPlacement.update({
      where: { id },
      data: {
        x,
        y,
        ...(rotation !== undefined && { rotation }),
      },
    });

    return NextResponse.json({ placement: updated }, { status: 200 });
  } catch (error) {
    logger.e(`Update sticker placement error: ${error}`);
    return NextResponse.json({ message: '스티커 이동 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

// 스티커 제거
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params;
    const id = parseInt(rawId);
    if (isNaN(id)) {
      return NextResponse.json({ message: '올바르지 않은 요청입니다.' }, { status: 400 });
    }

    await prisma.userStickerPlacement.delete({ where: { id } });

    return NextResponse.json({ message: '스티커가 제거되었습니다.' }, { status: 200 });
  } catch (error) {
    logger.e(`Delete sticker placement error: ${error}`);
    return NextResponse.json({ message: '스티커 제거 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
