import { NextResponse } from 'next/server';
import { prisma } from 'src/lib/prisma';
import { verifyAuth, unauthorizedResponse } from 'src/utils/auth';

export async function GET() {
  try {
    const posts = await prisma.post.findMany({
      include: {
        author: {
          select: {
            userId: true,
            nickname: true,
            name: true,
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

    return NextResponse.json({ posts }, { status: 200 });
  } catch (error) {
    console.error('Fetch posts error:', error);
    return NextResponse.json(
      { message: '게시글을 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await verifyAuth(request);
    if (!user) return unauthorizedResponse();

    const { content } = await request.json();

    if (!content || content.trim() === '') {
      return NextResponse.json(
        { message: '내용을 입력해주세요.' },
        { status: 400 }
      );
    }

    const post = await prisma.post.create({
      data: {
        content,
        authorId: user.userId,
      },
      include: {
        author: {
          select: {
            userId: true,
            nickname: true,
            name: true,
            profileImage: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: '게시글이 등록되었습니다.',
      post,
    }, { status: 201 });
  } catch (error) {
    console.error('Create post error:', error);
    return NextResponse.json(
      { message: '게시글 등록 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
