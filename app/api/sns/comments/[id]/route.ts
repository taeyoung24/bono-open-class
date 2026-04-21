import { NextResponse } from 'next/server';
import { prisma } from 'src/lib/prisma';
import { verifyAuth, unauthorizedResponse } from 'src/utils/auth';
import { logger } from 'src/utils/log';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyAuth(request);
    if (!user) return unauthorizedResponse();

    const commentId = Number((await params).id);

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return NextResponse.json(
        { message: '댓글을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    if (comment.authorId !== user.userId && user.role !== 'TEACHER') {
      return NextResponse.json(
        { message: '삭제 권한이 없습니다.' },
        { status: 403 }
      );
    }

    await prisma.comment.delete({
      where: { id: commentId },
    });

    return NextResponse.json({ message: '댓글이 삭제되었습니다.' }, { status: 200 });
  } catch (error) {
    logger.e(`Delete comment error: ${error}`);
    return NextResponse.json(
      { message: '댓글 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
