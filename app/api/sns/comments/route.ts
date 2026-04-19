import { NextResponse } from 'next/server';
import { prisma } from 'src/lib/prisma';
import { verifyAuth, unauthorizedResponse } from 'src/utils/auth';

export async function POST(request: Request) {
  try {
    const user = await verifyAuth(request);
    if (!user) return unauthorizedResponse();

    const { content, postId, parentCommentId } = await request.json();

    if (!content || !postId) {
      return NextResponse.json(
        { message: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      );
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        postId: Number(postId),
        authorId: user.userId,
        parentCommentId: parentCommentId ? Number(parentCommentId) : null,
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
      message: '댓글이 등록되었습니다.',
      comment,
    }, { status: 201 });
  } catch (error) {
    console.error('Create comment error:', error);
    return NextResponse.json(
      { message: '댓글 등록 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
