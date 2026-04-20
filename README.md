# Bono Open Class (본오열린교실)

어린 학생들을 대상으로 더욱 안전하고 통제 가능하며 흥미를 이끌 수 있는 환경을 마련하여 정보 교육의 능률을 높이기 위해 제작된 **안산열린교실 지역아동센터 컴퓨터 교육 전용 앱**입니다.

## 기능
- **회원가입 및 로그인**: 학생 개별 암호 지정 로그인 및 계정 접근 제어 (외부인 가입 통제)
- **메일(쪽지) 송수신 체험**: 플랫폼 내부 사용자간 이메일/쪽지를 주고받으며 수신/발신함 및 삭제 기능 등 디지털 서신 시스템 체험
- **SNS 활동 체험 (본오스퀘어)**: 100% 통제된 안전한 환경에서 게시글, 댓글, 좋아요 기능을 사용하는 모의 소셜 네트워크 서비스 경험
- **타자 연습 기록장**: 타자 연습 결과(타수, 정확도)를 저장하고 누적된 자신의 통계를 확인하여 학습 성취도 고취

## 시작하기 (Getting Started)

프로젝트를 처음 클론한 후 로컬 환경에서 실행하려면 다음 단계를 진행해 주세요. 본 프로젝트는 패키지 매니저로 [pnpm](https://pnpm.io/)을 사용합니다.

### 1. 의존성 설치
```bash
pnpm install
```

### 2. 환경 변수 세팅
프로젝트 루트 디렉토리에 `.env` 파일을 생성하고 아래와 같이 작성합니다. (SQLite를 사용하므로 파일 경로를 지정해 줍니다)
```bash
NODE_ENV="production" # 또는 "development"
DATABASE_URL="file:./main.db" # 또는 "file:./local.db"
DISCORD_WEBHOOK_URL="DISCORD_WEBHOOK_URL"
JWT_SECRET="JWT_SECRET"
```

### 3. 데이터베이스 초기화 및 Prisma 세팅
Prisma 마이그레이션을 적용하여 데이터베이스 구조를 동기화하고 Prisma 클라이언트를 생성합니다.
> [!IMPORTANT]
> 마이그레이션 실행 전 최상단 루트 디렉토리에 **`.env` 파일이 올바르게 세팅되어 있어야 합니다.** Prisma는 기본적으로 `.env` 파일을 참조합니다. 만약 `.env.development`와 같은 파일만 있다면, 잠시 `.env`로 이름을 변경하거나 복사본을 만든 후 진행하세요.

**개발 환경 (새로운 변경사항 적용 시)**
```bash
pnpm prisma migrate dev --name init
```

**운영/배포 환경 (기존 마이그레이션 파일 배포)**
```bash
pnpm prisma migrate deploy
```

**Prisma Client 수동 생성 (필요 시)**
```bash
pnpm prisma generate
```

### 4. 개발 서버 실행
```bash
pnpm dev
```
이제 브라우저에서 `http://localhost:3000`으로 접속하여 앱을 확인할 수 있습니다.

### 5. 데이터베이스 확인 (Prisma Studio)
브라우저를 통해 GUI 환경에서 데이터베이스 내용을 확인하고 직접 수정하려면 다음 명령어를 실행하세요.
```bash
pnpm prisma studio
```
기본적으로 `http://localhost:5555`에서 확인 가능합니다.