#!/bin/bash
cd "$(dirname "$0")/.."

echo "최신 코드 의존성 설치 및 빌드 시작..."
pnpm install
pnpm prisma generate
pnpm run build

echo "PM2 무중단 리로드 진행 중..."
pm2 reload bono-open-class

echo "무중단 배포(Reload)가 완료되었습니다!"
