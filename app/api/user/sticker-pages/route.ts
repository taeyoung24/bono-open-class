import { NextResponse } from 'next/server';
import { prisma } from 'src/lib/prisma';
import { logger } from 'src/utils/log';

// 사용자의 스티커 페이지 목록 조회
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ message: '사용자 아이디가 필요합니다.' }, { status: 400 });
    }

    const pages = await prisma.stickerPage.findMany({
      where: { userId },
      orderBy: { pageNumber: 'asc' },
    });

    return NextResponse.json({ pages }, { status: 200 });
  } catch (error) {
    logger.e(`Fetch sticker pages error: ${error}`);
    return NextResponse.json({ message: '페이지 목록을 불러오는 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

// 새 스티커 페이지 생성
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, title, backgroundColor, pageNumber: requestedPageNumber } = body;

    if (!userId) {
      return NextResponse.json({ message: '사용자 아이디가 필요합니다.' }, { status: 400 });
    }

    let targetPageNumber: number;

    if (requestedPageNumber !== undefined) {
      // 1. 요청된 특정 페이지 번호가 이미 존재하는지 확인 (중복 생성 방지)
      const existingPage = await prisma.stickerPage.findFirst({
        where: { userId, pageNumber: requestedPageNumber }
      });

      if (existingPage) {
        // 이미 존재한다면 생성하지 않고 기존 정보 반환 (200 OK)
        return NextResponse.json({ page: existingPage, message: '이미 존재하는 페이지입니다.' }, { status: 200 });
      }
      targetPageNumber = requestedPageNumber;
    } else {
      // 2. 페이지 번호가 지정되지 않은 경우 다음 번호 계산
      const lastPage = await prisma.stickerPage.findFirst({
        where: { userId },
        orderBy: { pageNumber: 'desc' },
      });
      targetPageNumber = lastPage ? lastPage.pageNumber + 1 : 1;
    }

    const newPage = await prisma.stickerPage.create({
      data: {
        userId,
        pageNumber: targetPageNumber,
        title: title || `${targetPageNumber}쪽`,
        backgroundColor: backgroundColor || '#ffffff',
      },
    });

    return NextResponse.json({ page: newPage }, { status: 201 });
  } catch (error) {
    logger.e(`Create sticker page error: ${error}`);
    return NextResponse.json({ message: '페이지를 생성하는 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
