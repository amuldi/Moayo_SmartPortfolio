# Moayo Smart Portfolio

한국 주식 포트폴리오를 계좌 단위로 정리하고, 현재 시세와 목표 비중을 기준으로 리밸런싱을 점검하는 웹앱입니다.

Production: https://moayo-smartportfolio.vercel.app

현재 코드 기준 최신 작업은 다음까지 반영되어 있습니다.

- 금융앱 느낌의 미니멀 랜딩 페이지
- 포트폴리오, 리밸런싱, 설정 화면 리디자인
- 보유 종목과 관심 종목의 현재가 자동 갱신
- 로컬/전용 서버 환경의 Finnhub WebSocket 실시간 체결가 반영
- Vercel 환경의 REST 30초 자동 갱신 fallback
- Figma 캡처용 프리뷰 라우트

## 실행 화면

### 랜딩

![Landing](docs/screenshots/landing.png)

### 포트폴리오

![Portfolio](docs/screenshots/portfolio.png)

### 리밸런싱

![Rebalancing](docs/screenshots/rebalancing.png)

### 설정

![Settings](docs/screenshots/settings.png)

## 주요 기능

- 계좌별 포트폴리오 관리
- JSON/CSV 포트폴리오 불러오기
- 보유 종목 추가, 수정, 삭제
- 관심 종목 관리
- 현재가 기반 평가금액 계산
- 목표 비중 합계 점검
- 투자 성향별 리밸런싱 분석
- 추천 조정 순서와 참고 금액 계산
- Google, Naver, 이메일 인증
- 게스트 모드
- 라이트/다크 테마, 강조 색상, 글자 크기, 레이아웃 밀도 설정

## 아키텍처

```mermaid
flowchart LR
  User["사용자"] --> Browser["브라우저"]
  Browser --> React["React 18 + Vite"]
  React --> Router["React Router"]
  React --> Store["Zustand Stores"]
  React --> UI["Tailwind UI Components"]
  React --> Charts["Recharts"]

  React --> ApiClient["services/apiClient"]
  ApiClient --> VercelFn["api/[...path].js"]
  VercelFn --> Express["Express App"]

  Express --> Auth["Auth APIs"]
  Express --> PortfolioApi["Portfolio APIs"]
  Express --> MarketApi["Market Data APIs"]
  Express --> Health["Health Checks"]

  Auth --> Repo["Repository Layer"]
  PortfolioApi --> Repo
  Repo --> Neon["Neon Postgres"]
  Repo --> JsonFallback["Local JSON Fallback"]

  MarketApi --> Yahoo["Yahoo Finance REST"]
  MarketApi --> Fx["FX Rate Cache"]

  Browser <-. "/ws local only" .-> WsServer["Express WebSocket Server"]
  WsServer --> Finnhub["Finnhub WebSocket"]
  WsServer --> Store

  React --> FigmaRoutes["/figma/* Preview Routes"]
  FigmaRoutes --> Figma["Figma Capture"]
```

## 데이터 흐름

```mermaid
sequenceDiagram
  participant U as User
  participant R as React App
  participant S as Zustand
  participant A as Express API
  participant Y as Yahoo Finance
  participant F as Finnhub WS

  U->>R: 포트폴리오 화면 진입
  R->>S: 보유 종목/관심 종목 조회
  R->>A: POST /api/quotes
  A->>Y: 현재가 조회
  Y-->>A: quote 응답
  A-->>R: quotes + fx
  R->>S: livePrices 갱신

  alt FINNHUB_API_KEY가 있는 로컬/전용 서버
    R->>A: WebSocket /ws subscribe
    A->>F: symbol subscribe
    F-->>A: trade tick
    A-->>R: trade message
    R->>S: 체결가 즉시 반영
  else Vercel Functions 또는 API 키 없음
    R->>S: 30초 REST 자동 갱신 유지
  end
```

## 기술 스택

| 영역 | 기술 |
| --- | --- |
| Frontend | React 18, Vite, Tailwind CSS |
| 상태 관리 | Zustand |
| 차트 | Recharts |
| 아이콘 | lucide-react |
| Backend | Express.js |
| 인증 | httpOnly cookie, JWT, refresh token rotation, bcryptjs |
| OAuth | Google, Naver |
| 시세 | yahoo-finance2, Finnhub WebSocket |
| 저장소 | Neon Postgres, Local JSON fallback |
| 배포 | Vercel Static Hosting + Vercel Functions |
| 디자인 연동 | Figma capture preview routes |

## 폴더 구조

```text
.
├── api/
│   └── [...path].js
├── docs/
│   └── screenshots/
├── server/
│   ├── db/
│   ├── repositories/
│   ├── server.js
│   ├── stockProvider.js
│   └── validation.js
├── src/
│   ├── components/
│   ├── data/
│   ├── features/portfolio/
│   ├── pages/
│   ├── services/
│   ├── store/
│   └── utils/
├── index.html
├── package.json
├── vite.config.js
└── vercel.json
```

## 로컬 실행

요구사항:

- Node.js 22 이상
- npm 10 이상

설치:

```bash
npm install
```

프론트엔드:

```bash
npm run dev
```

API 서버:

```bash
npm run server
```

기본 주소:

- Frontend: `http://localhost:3001`
- API: `http://127.0.0.1:4000/api/health`

## 환경 변수

`.env.example`을 복사해 `.env`를 만듭니다.

필수:

```env
JWT_SECRET=replace-with-a-unique-32-plus-character-secret
APP_URL=http://localhost:3001
ALLOWED_ORIGINS=http://localhost:3001,http://localhost:3000
```

선택:

```env
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
VITE_NAVER_CLIENT_ID=your-naver-client-id
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
NAVER_CLIENT_ID=your-naver-client-id
NAVER_CLIENT_SECRET=your-naver-client-secret
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-app-password
FINNHUB_API_KEY=your-finnhub-key
VITE_ENABLE_REALTIME_WS=false
DATABASE_URL=postgresql://user:password@host:5432/moayo
UPSTASH_REDIS_REST_URL=https://your-upstash-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-upstash-token
SENTRY_DSN=https://examplePublicKey@o0.ingest.sentry.io/0
VITE_SENTRY_DSN=https://examplePublicKey@o0.ingest.sentry.io/0
```

## 실시간 시세 정책

- 기본 시세는 Yahoo Finance REST API를 사용합니다.
- 포트폴리오 화면은 30초마다 자동 갱신합니다.
- 브라우저 focus, online, visibility 복귀 시 다시 조회합니다.
- `FINNHUB_API_KEY`가 있는 로컬/전용 Express 서버에서는 `/ws`로 체결가를 즉시 반영합니다.
- Vercel Functions는 WebSocket 서버를 유지하지 않으므로 배포본은 REST 자동 갱신으로 동작합니다.

## Figma 연동

개발 환경에서는 Figma 캡처용 프리뷰 라우트를 제공합니다.

```text
/figma/portfolio
/figma/analysis
/figma/settings
```

Figma 파일:

- Portfolio: https://www.figma.com/design/StucgxKdsV1VSoMh55nSG3?node-id=35-2
- Rebalancing: https://www.figma.com/design/StucgxKdsV1VSoMh55nSG3?node-id=36-2
- Settings: https://www.figma.com/design/StucgxKdsV1VSoMh55nSG3?node-id=37-2

## 주요 API

| Method | Path | 설명 |
| --- | --- | --- |
| POST | `/api/auth/register` | 이메일 회원가입 |
| POST | `/api/auth/login` | 이메일 로그인 |
| GET | `/api/auth/me` | 현재 사용자 |
| POST | `/api/auth/refresh` | 세션 갱신 |
| POST | `/api/auth/logout` | 로그아웃 |
| GET | `/api/portfolio` | 포트폴리오 조회 |
| PUT | `/api/portfolio` | 포트폴리오 저장 |
| GET | `/api/quote/:ticker` | 단일 종목 시세 |
| POST | `/api/quotes` | 여러 종목 시세 |
| GET | `/api/chart/:ticker` | 차트 데이터 |
| GET | `/api/history/:ticker` | 과거 데이터 |
| GET | `/api/health` | 헬스 체크 |
| GET | `/api/health/live` | 라이브니스 |
| GET | `/api/health/ready` | 레디니스 |

## 검증

이번 작업에서 실행한 검증:

```bash
npm run build
npm run lint
```

결과:

- 빌드 성공
- 린트 에러 없음
- 기존 unused warning 일부 존재
- Chrome headless로 랜딩, 포트폴리오, 리밸런싱, 설정 화면 캡처 확인

## 배포

Vercel 배포 명령:

```bash
npx vercel link --project moayo-smartportfolio
npx vercel deploy --prod
```

현재 README와 스크린샷은 최신 로컬 코드 기준입니다. 최신 코드의 실제 배포는 별도 실행이 필요합니다.

## 투자 참고 고지

Moayo의 분석, 리밸런싱, 백테스트, 시세 정보는 투자 자문이나 매매 권유가 아닌 참고 정보입니다. 최종 투자 판단과 실제 거래 실행은 사용자 본인의 책임입니다.
