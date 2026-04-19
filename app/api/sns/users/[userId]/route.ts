import { NextResponse } from 'next/server';
import { prisma } from 'src/lib/prisma';
import { logger } from 'src/utils/log';

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = await params;

    const profile = await prisma.user.findUnique({
      where: { userId },
      select: {
        userId: true,
        nickname: true,
        profileImage: true,
        bio: true,
        // points 등의 개인 정보는 제외 (상세 피드백 반영)
        createdAt: true,
      },
    });

    if (!profile) {
      return NextResponse.json(
        { message: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const posts = await prisma.post.findMany({
      where: { authorId: userId },
      include: {
        author: {
          select: {
            userId: true,
            nickname: true,
            profileImage: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
        likes: {
          select: {
            userId: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ profile, posts }, { status: 200 });
  } catch (error) {
    logger.e(`Fetch public profile error: ${error}`);
    return NextResponse.json(
      { message: '프로필 정보를 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
