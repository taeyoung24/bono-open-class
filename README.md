본오동지역아동센터 안산열린교실에서 사용하는 간단한 진도관리 앱

## 기능
- 자기만의 암호를 지정하여 로그인
- 선생님이 승인한 스탬프 (배지) 수집

## 시작하기 (Getting Started)

프로젝트를 처음 클론한 후 로컬 환경에서 실행하려면 다음 단계를 진행해 주세요. 본 프로젝트는 패키지 매니저로 [pnpm](https://pnpm.io/)을 사용합니다.

### 1. 의존성 설치
```bash
pnpm install
```

### 2. 환경 변수 세팅
프로젝트 루트 디렉토리에 `.env` 파일을 생성하고 아래와 같이 작성합니다. (SQLite를 사용하므로 파일 경로를 지정해 줍니다)
```env
DATABASE_URL="file:./dev.db"
```

### 3. 데이터베이스 초기화 및 Prisma 세팅
Prisma 마이그레이션을 적용하여 SQLite 데이터베이스 파일을 생성하고, Prisma 클라이언트를 생성합니다.
```bash
pnpm prisma migrate dev
pnpm prisma generate
```

### 4. 개발 서버 실행
```bash
pnpm dev
```
이제 브라우저에서 `http://localhost:3000`으로 접속하여 앱을 확인할 수 있습니다.

### 5. 데이터베이스 확인 (Prisma Studio)
브라우저를 통해 데이터베이스 내용을 확인하고 직접 수정하려면 다음 명령어를 실행하세요.
```bash
npx prisma studio --env-file .env.development
```
기본적으로 `http://localhost:5555`에서 확인 가능합니다.