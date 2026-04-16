import { NextResponse } from 'next/server';
import { prisma } from 'src/lib/prisma';

export async function PATCH(request: Request) {
  try {
    const { mailId } = await request.json();

    if (!mailId) {
      return NextResponse.json(
        { message: '메일 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 메일 읽음 처리
    const updatedMail = await prisma.mail.update({
      where: { id: Number(mailId) },
      data: { isRead: true },
    });

    return NextResponse.json({ mail: updatedMail }, { status: 200 });
  } catch (error) {
    console.error('Mail read update error:', error);
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
