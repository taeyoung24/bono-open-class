#!/bin/bash
cd "$(dirname "$0")/.."

echo "최신 코드 의존성 설치 및 빌드 시작..."
pnpm install
pnpm prisma generate
pnpm run build

echo "PM2 프로세스 업데이트 중..."

# 메인 앱은 무중단(Reload)으로 서비스 유지
pm2 reload bono-open-class

# 스튜디오는 새로운 스키마 반영을 위해 재시작(Restart)
pm2 restart prisma-studio

echo "모든 서비스 업데이트가 완료되었습니다!"
