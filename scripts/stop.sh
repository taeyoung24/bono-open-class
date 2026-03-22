#!/bin/bash

echo "Next.js 애플리케이션을 완전히 종료합니다..."

pm2 delete bono-open-class
pm2 delete prisma-studio

echo "애플리케이션과 DB 스튜디오가 PM2 목록에서 깔끔하게 삭제되었습니다."
