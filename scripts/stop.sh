#!/bin/bash

echo "Next.js 애플리케이션을 완전히 종료합니다..."

pm2 delete bono-open-class

echo "애플리케이션이 완전히 종료되고 PM2 목록에서 삭제되었습니다."
