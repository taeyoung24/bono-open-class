import { NextResponse } from 'next/server';
import { prisma } from 'src/lib/prisma';
import { logger } from 'src/utils/log';

// 스티커 페이지 정보 수정 (제목, 배경색 등)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params;
    const id = parseInt(rawId);
    const body = await request.json();
    const { title, backgroundColor } = body;

    if (isNaN(id)) {
      return NextResponse.json({ message: '올바르지 않은 요청입니다.' }, { status: 400 });
    }

    const updated = await prisma.stickerPage.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(backgroundColor !== undefined && { backgroundColor }),
      },
    });

    return NextResponse.json({ page: updated }, { status: 200 });
  } catch (error) {
    logger.e(`Update sticker page error: ${error}`);
    return NextResponse.json({ message: '페이지 수정 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

// 스티커 페이지 삭제
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

    // 페이지 삭제 (Cascade 설정에 의해 배치 정보도 삭제됨)
    await prisma.stickerPage.delete({
      where: { id },
    });

    return NextResponse.json({ message: '페이지가 삭제되었습니다.' }, { status: 200 });
  } catch (error) {
    logger.e(`Delete sticker page error: ${error}`);
    return NextResponse.json({ message: '페이지 삭제 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
