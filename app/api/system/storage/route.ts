import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { logger } from 'src/utils/log';
import { formatCompactFileSize } from 'src/utils/str';

// 디렉토리 크기를 재귀적으로 계산하는 함수
function getDirSize(dirPath: string): number {
  let size = 0;
  if (!fs.existsSync(dirPath)) return 0;

  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stats = fs.statSync(filePath);

    if (stats.isDirectory()) {
      size += getDirSize(filePath);
    } else {
      size += stats.size;
    }
  }
  return size;
}


export async function GET() {
  try {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    const usedBytes = getDirSize(uploadDir);
    
    // 전체 할당량 (1GB)
    const totalQuota = 1024 * 1024 * 1024; 
    const remainingBytes = Math.max(0, totalQuota - usedBytes);

    return NextResponse.json({
      usedBytes,
      remainingBytes,
      usedFormatted: formatCompactFileSize(usedBytes),
      remainingFormatted: formatCompactFileSize(remainingBytes),
      totalQuotaFormatted: formatCompactFileSize(totalQuota)
    }, { status: 200 });
  } catch (error) {
    logger.e(`Failed to get storage info: ${error}`);
    return NextResponse.json({ message: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
