# Moayo — 한국 투자자를 위한 포트폴리오 플랫폼

> ISA, 연금저축, IRP, 종합위탁, CMA 계좌를 하나의 대시보드에서.
> 실시간 시세 · 세금 최적화 · AI 진단 · 백테스팅을 무료로 제공합니다.

---

## 핵심 가치

| 문제 | Moayo의 해결책 |
|------|----------------|
| 계좌가 여러 증권사에 흩어져 있음 | 모든 계좌를 수동 입력해 통합 관리 |
| 세금 계산이 복잡함 | 계좌 유형별 한국 세법 자동 분석 |
| 포트폴리오 건전성 파악이 어려움 | AI가 집중도·지역·자산군 리스크를 즉시 진단 |
| 과거 성과를 알 수 없음 | 최대 6년 백테스팅 엔진 내장 |

---

## 주요 기능

- **실시간 시세** — Yahoo Finance 기반, API 키 불필요. 국내·미국·ETF 전 종목 지원
- **계좌 통합 관리** — ISA / 연금저축 / IRP / 종합위탁 / CMA / 금현물 계좌 지원
- **자산 배분 분석** — 자산군·지역별 파이차트, 상위 보유 종목 히트맵
- **세금 최적화** — 계좌별 절세 전략 자동 생성 (ISA 비과세, 해외주식 양도세 등)
- **AI 포트폴리오 진단** — 집중도 리스크, 지역 편중, 자산군 불균형 자동 감지
- **백테스팅 엔진** — 최대 6년 시뮬레이션, S&P 500 / 올웨더 벤치마크 비교
- **관심종목 (Watchlist)** — 종목을 사지 않고도 사이드바에서 실시간 모니터링
- **다크/라이트 테마** — 7가지 액센트 컬러, 폰트 크기/밀도 설정
- **Google / 카카오 소셜 로그인** + 이메일 인증

---

## 기술 스택

| 영역 | 기술 |
|------|------|
| Frontend | React 18, Vite, Tailwind CSS |
| 상태 관리 | Zustand (persist) |
| 차트 | Recharts |
| 라우팅 | React Router v6 |
| 아이콘 | lucide-react |
| Backend | Express.js (Node 20+) |
| 주가 데이터 | yahoo-finance2 v3 (무료, API 키 불필요) |
| 인증 | JWT, bcryptjs, Google OAuth |
| 실시간 | WebSocket (Finnhub 선택사항) |
| 보안 | express-rate-limit, morgan |
| DB | JSON flat-file (개발용) |

---

## 설치 및 실행

### 사전 요구사항

- Node.js 20+
- npm 9+

### 1. 프로젝트 클론

```bash
git clone <repo-url>
cd moayo
```

### 2. 프론트엔드 의존성 설치

```bash
npm install
```

### 3. 백엔드 의존성 설치

```bash
cd server && npm install && cd ..
```

### 4. 환경변수 설정

루트에 `.env` 파일 생성:

```env
# ── Frontend (Vite) ───────────────────────────
# Google OAuth (선택사항 — 없으면 버튼 비활성화)
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com

# Kakao 로그인 (선택사항)
VITE_KAKAO_APP_KEY=your-kakao-app-key

# ── Backend ───────────────────────────────────
# 반드시 긴 랜덤 문자열로 변경하세요
JWT_SECRET=your-super-secret-jwt-key-min-32-chars

# 앱 URL (이메일 인증 링크 생성에 사용)
APP_URL=http://localhost:3001

# CORS 허용 도메인 (쉼표 구분)
ALLOWED_ORIGINS=http://localhost:3001

# 이메일 인증 (선택사항 — 없으면 콘솔 출력)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password

# Finnhub WebSocket 실시간 시세 (선택사항)
FINNHUB_API_KEY=your-finnhub-key
```

### 5. 서버 실행

터미널 1 — 백엔드:

```bash
cd server && node server.js
```

터미널 2 — 프론트엔드:

```bash
npm run dev
```

브라우저에서 `http://localhost:3001` 접속.

---

## 폴더 구조

```
moayo/
├── src/
│   ├── components/
│   │   ├── auth/         # ProtectedRoute
│   │   ├── charts/       # StockChart, AllocationPie, PerformanceChart
│   │   ├── layout/       # AppLayout, TopNav, RightSidebar
│   │   ├── portfolio/    # AccountCard, AddAssetModal, HoldingRow
│   │   └── ui/           # Button, Card, Modal, BrandIcon, Badge ...
│   ├── constants/
│   │   └── colors.js     # CLASS_COLORS, CHART_PALETTE
│   ├── pages/
│   │   ├── Landing.jsx
│   │   ├── Login.jsx / Register.jsx / VerifyEmail.jsx
│   │   ├── Home.jsx      # 실시간 차트 + 관심종목 사이드바
│   │   ├── MyPortfolio.jsx
│   │   ├── Analysis.jsx  # 탭: 현황 / 세금 / AI / 벤치마크 / 백테스팅
│   │   └── Settings.jsx
│   ├── services/
│   │   ├── stockAPI.js   # 프론트→서버 API 클라이언트
│   │   ├── mockData.js   # 종목 유니버스 (100+ 종목)
│   │   ├── aiService.js  # 룰 기반 AI 포트폴리오 진단
│   │   ├── taxService.js # 한국 세금 분석
│   │   └── backtestService.js
│   ├── store/
│   │   ├── authStore.js
│   │   ├── portfolioStore.js  # accounts, livePrices, watchlist
│   │   └── settingsStore.js
│   └── utils/
│       ├── financialCalc.js
│       └── formatters.js
└── server/
    ├── server.js         # Express + WebSocket 서버
    └── stockProvider.js  # yahoo-finance2 래퍼
```

---

## 비즈니스 전략

### 타겟 사용자
- 한국 개인 투자자 (2030~4050세대)
- 복수 계좌를 운용하는 투자자
- ISA / 연금저축 절세를 원하는 직장인

### 수익화 모델

| 플랜 | 가격 | 주요 기능 |
|------|------|-----------|
| Free | 무료 | 포트폴리오 1개, 기본 AI, 실시간 시세 |
| Pro | 월 9,900원 | 포트폴리오 무제한, 가격 알림, CSV 내보내기 |
| Team | 월 29,900원 | 팀 공유, API 연동, 어드바이저 도구 |

### 차별화 포인트

1. **한국 세법 특화** — ISA 비과세, 해외주식 양도세, IRP 세액공제를 실제 계산
2. **계좌 유형 인식** — 단순 자산 합산이 아닌 계좌별 세금 구조를 반영한 최적화
3. **완전 무료 시작** — Yahoo Finance로 API 키 없이 즉시 실시간 시세 제공

---

## 로드맵

- [ ] 증권사 API 연동 (한국투자증권 KIS, 키움 Open API)
- [ ] 가격 알림 (목표가 도달 시 이메일/앱 푸시)
- [ ] 배당금 추적 및 예상 수령액 캘린더
- [ ] 포트폴리오 공유 링크 (읽기 전용)
- [ ] Claude AI 연동 (자연어 포트폴리오 상담)
- [ ] 모바일 앱 (React Native)

---

## Google OAuth 설정

1. [Google Cloud Console](https://console.cloud.google.com) 접속
2. `API 및 서비스` → `사용자 인증 정보` → OAuth 2.0 클라이언트 ID 선택
3. **승인된 JavaScript 원본** 추가:
   ```
   http://localhost:3001
   ```
4. 발급된 클라이언트 ID를 `.env`의 `VITE_GOOGLE_CLIENT_ID`에 입력

---

## 기여 가이드

1. 이슈 또는 기능 제안 먼저 등록
2. `feature/기능명` 브랜치 생성
3. 변경사항 PR 제출
4. 리뷰 후 main 병합

---

## 라이선스

MIT
