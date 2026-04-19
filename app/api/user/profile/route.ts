import { NextResponse } from 'next/server';
import { prisma } from 'src/lib/prisma';
import { verifyAuth, unauthorizedResponse } from 'src/utils/auth';

export async function PATCH(request: Request) {
  try {
    const user = await verifyAuth(request);
    if (!user) return unauthorizedResponse();

    const { nickname, profileImage, bio } = await request.json();

    const updatedUser = await prisma.user.update({
      where: { userId: user.userId },
      data: {
        nickname: nickname !== undefined ? nickname : undefined,
        profileImage: profileImage !== undefined ? profileImage : undefined,
        bio: bio !== undefined ? bio : undefined,
      },
    });

    return NextResponse.json({
      message: '프로필이 성공적으로 수정되었습니다.',
      user: {
        userId: updatedUser.userId,
        nickname: updatedUser.nickname,
        profileImage: updatedUser.profileImage,
        bio: updatedUser.bio,
      },
    }, { status: 200 });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { message: '프로필 수정 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
