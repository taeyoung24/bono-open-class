import { NextResponse } from 'next/server';
import { prisma } from 'src/lib/prisma';
import { verifyAuth, unauthorizedResponse } from 'src/utils/auth';

export async function POST(request: Request) {
  try {
    const user = await verifyAuth(request);
    if (!user) return unauthorizedResponse();

    const { postId } = await request.json();

    if (!postId) {
      return NextResponse.json(
        { message: '게시글 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    const id = Number(postId);

    // 이미 좋아요를 눌렀는지 확인
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId: user.userId,
          postId: id,
        },
      },
    });

    if (existingLike) {
      // 이미 있다면 취소 (Toggle)
      await prisma.like.delete({
        where: { id: existingLike.id },
      });
      return NextResponse.json({ message: '좋아요 취소', liked: false }, { status: 200 });
    } else {
      // 없다면 추가
      await prisma.like.create({
        data: {
          userId: user.userId,
          postId: id,
        },
      });
      return NextResponse.json({ message: '좋아요 성공', liked: true }, { status: 200 });
    }
  } catch (error) {
    console.error('Like toggle error:', error);
    return NextResponse.json(
      { message: '좋아요 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
