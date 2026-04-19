import { NextResponse } from 'next/server';
import { prisma } from 'src/lib/prisma';
import { verifyAuth, unauthorizedResponse } from 'src/utils/auth';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const postId = Number((await params).id);

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: {
          select: {
            userId: true,
            nickname: true,
            name: true,
            profileImage: true,
            bio: true,
          },
        },
        comments: {
          include: {
            author: {
              select: {
                userId: true,
                nickname: true,
                profileImage: true,
              },
            },
            replies: {
              include: {
                author: {
                  select: {
                    userId: true,
                    nickname: true,
                    profileImage: true,
                  },
                },
              },
            },
          },
          where: {
            parentCommentId: null, // 최상위 댓글만 먼저 가져오고 대댓글은 replies로 포함
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
        likes: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!post) {
      return NextResponse.json(
        { message: '게시글을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ post }, { status: 200 });
  } catch (error) {
    console.error('Fetch post detail error:', error);
    return NextResponse.json(
      { message: '게시글 상세 정보를 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await verifyAuth(request);
    if (!user) return unauthorizedResponse();

    const postId = Number((await params).id);

    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return NextResponse.json(
        { message: '게시글을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 작성자 본인 확인 (또는 관리자 권한 확인 로직 추가 가능)
    if (post.authorId !== user.userId && user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: '삭제 권한이 없습니다.' },
        { status: 403 }
      );
    }

    await prisma.post.delete({
      where: { id: postId },
    });

    return NextResponse.json({ message: '게시글이 삭제되었습니다.' }, { status: 200 });
  } catch (error) {
    console.error('Delete post error:', error);
    return NextResponse.json(
      { message: '게시글 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
