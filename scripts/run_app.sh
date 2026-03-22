#!/bin/bash
cd "$(dirname "$0")/.."

echo "의존성 설치 및 Next.js 앱 빌드 시작..."
pnpm install
pnpm prisma generate
pnpm run build

echo "프로덕션 서버 실행 중..."
PORT=5033 pm2 start pnpm --name "bono-open-class" -- start

echo "Prisma Studio 실행 중 (백그라운드)..."
# --host 0.0.0.0 옵션을 추가하여 Tailscale IP로 접속 가능하게 설정
pm2 start "pnpm prisma studio --port 5555 --browser none --hostname 0.0.0.0" --name "prisma-studio"

echo "Next.js 애플리케이션이 PM2 백그라운드에서 시작되었습니다!"
echo "상태를 보려면 'pm2 status' 또는 실시간 로그를 보려면 'pm2 logs bono-open-class'를 입력하세요."
