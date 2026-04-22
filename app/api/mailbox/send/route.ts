import { NextResponse } from 'next/server';
import { prisma } from 'src/lib/prisma';
import { logger } from 'src/utils/log';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const senderId = formData.get('senderId') as string;
    const receiverEmail = formData.get('receiverEmail') as string;
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const files = formData.getAll('files') as File[];

    if (!senderId || !receiverEmail || !title || !content) {
      return NextResponse.json(
        { message: '모든 필드를 입력해야 합니다.' },
        { status: 400 }
      );
    }

    // 수신자가 존재하는지 확인 (이메일 기준)
    const receiver = await prisma.user.findUnique({
      where: { email: receiverEmail },
    });

    if (!receiver) {
      return NextResponse.json(
        { message: '수신자를 찾을 수 없습니다. 이메일 주소를 확인해주세요.' },
        { status: 404 }
      );
    }

    // 파일 저장 경로 설정
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'mail_attachments');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const attachmentData = [];

    // 파일 시스템에 저장 및 DB 메타데이터 준비
    for (const file of files) {
      if (!file || typeof file === 'string') continue;
      
      const buffer = Buffer.from(await file.arrayBuffer());
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      // 파일명에 포함된 특수문자를 안전하게 변환
      const safeFileName = file.name.replace(/[^a-zA-Z0-9가-힣.-]/g, '_');
      const filename = `${uniqueSuffix}-${safeFileName}`;
      const filePath = path.join(uploadDir, filename);
      
      fs.writeFileSync(filePath, buffer);
      
      attachmentData.push({
        originalName: file.name,
        savedPath: `/uploads/mail_attachments/${filename}`,
        size: file.size,
        mimeType: file.type || 'application/octet-stream',
      });
    }

    // 메일 및 첨부파일 정보 DB 저장
    const newMail = await prisma.mail.create({
      data: {
        senderId,
        receiverId: receiver.userId,
        title,
        content,
        attachments: {
          create: attachmentData,
        }
      },
      include: {
        attachments: true
      }
    });

    return NextResponse.json(
      { message: '메일이 전송되었습니다.', mail: newMail },
      { status: 201 }
    );
  } catch (error) {
    logger.e(`Mail send error: ${error}`);
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
