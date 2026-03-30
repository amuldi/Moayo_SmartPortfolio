// ─── 종목 유니버스 ─────────────────────────────────────────
export const ASSET_UNIVERSE = [

  // ── KOSPI 대형주 ───────────────────────────────────────────
  { ticker: '005930', name: '삼성전자',         sector: '반도체·전자',  region: '국내', assetClass: 'equity',    currency: 'KRW', price: 55800,   annualReturn: 6.4,  volatility: 22.1, expenseRatio: 0 },
  { ticker: '000660', name: 'SK하이닉스',        sector: '반도체·전자',  region: '국내', assetClass: 'equity',    currency: 'KRW', price: 192000,  annualReturn: 11.2, volatility: 30.4, expenseRatio: 0 },
  { ticker: '005380', name: '현대차',            sector: '자동차',       region: '국내', assetClass: 'equity',    currency: 'KRW', price: 212000,  annualReturn: 8.4,  volatility: 24.3, expenseRatio: 0 },
  { ticker: '000270', name: '기아',              sector: '자동차',       region: '국내', assetClass: 'equity',    currency: 'KRW', price: 88400,   annualReturn: 8.8,  volatility: 25.1, expenseRatio: 0 },
  { ticker: '035420', name: 'NAVER',             sector: 'IT·플랫폼',   region: '국내', assetClass: 'equity',    currency: 'KRW', price: 178000,  annualReturn: 7.8,  volatility: 26.7, expenseRatio: 0 },
  { ticker: '035720', name: '카카오',            sector: 'IT·플랫폼',   region: '국내', assetClass: 'equity',    currency: 'KRW', price: 34800,   annualReturn: 4.2,  volatility: 31.2, expenseRatio: 0 },
  { ticker: '207940', name: '삼성바이오로직스', sector: '바이오·헬스', region: '국내', assetClass: 'equity',    currency: 'KRW', price: 1048000, annualReturn: 10.2, volatility: 27.6, expenseRatio: 0 },
  { ticker: '068270', name: '셀트리온',          sector: '바이오·헬스', region: '국내', assetClass: 'equity',    currency: 'KRW', price: 168500,  annualReturn: 6.4,  volatility: 33.1, expenseRatio: 0 },
  { ticker: '006400', name: '삼성SDI',           sector: '2차전지',      region: '국내', assetClass: 'equity',    currency: 'KRW', price: 196000,  annualReturn: 5.2,  volatility: 31.4, expenseRatio: 0 },
  { ticker: '051910', name: 'LG화학',            sector: '2차전지',      region: '국내', assetClass: 'equity',    currency: 'KRW', price: 214000,  annualReturn: 4.8,  volatility: 29.2, expenseRatio: 0 },
  { ticker: '373220', name: 'LG에너지솔루션',   sector: '2차전지',      region: '국내', assetClass: 'equity',    currency: 'KRW', price: 278000,  annualReturn: 6.2,  volatility: 28.8, expenseRatio: 0 },
  { ticker: '105560', name: 'KB금융',            sector: '금융',         region: '국내', assetClass: 'equity',    currency: 'KRW', price: 94200,   annualReturn: 8.4,  volatility: 19.4, expenseRatio: 0 },
  { ticker: '055550', name: '신한지주',          sector: '금융',         region: '국내', assetClass: 'equity',    currency: 'KRW', price: 56800,   annualReturn: 7.6,  volatility: 18.9, expenseRatio: 0 },
  { ticker: '086790', name: '하나금융지주',      sector: '금융',         region: '국내', assetClass: 'equity',    currency: 'KRW', price: 68400,   annualReturn: 7.8,  volatility: 19.8, expenseRatio: 0 },
  { ticker: '316140', name: '우리금융지주',      sector: '금융',         region: '국내', assetClass: 'equity',    currency: 'KRW', price: 14200,   annualReturn: 6.4,  volatility: 20.1, expenseRatio: 0 },
  { ticker: '138040', name: '메리츠금융지주',    sector: '금융',         region: '국내', assetClass: 'equity',    currency: 'KRW', price: 108000,  annualReturn: 13.4, volatility: 24.3, expenseRatio: 0 },
  { ticker: '005490', name: 'POSCO홀딩스',      sector: '철강·소재',   region: '국내', assetClass: 'equity',    currency: 'KRW', price: 248000,  annualReturn: 5.2,  volatility: 23.7, expenseRatio: 0 },
  { ticker: '028260', name: '삼성물산',          sector: '건설·건자재', region: '국내', assetClass: 'equity',    currency: 'KRW', price: 158000,  annualReturn: 6.8,  volatility: 18.4, expenseRatio: 0 },
  { ticker: '032830', name: '삼성생명',          sector: '보험',         region: '국내', assetClass: 'equity',    currency: 'KRW', price: 104000,  annualReturn: 6.4,  volatility: 17.2, expenseRatio: 0 },
  { ticker: '017670', name: 'SK텔레콤',          sector: '통신',         region: '국내', assetClass: 'equity',    currency: 'KRW', price: 59400,   annualReturn: 5.4,  volatility: 14.8, expenseRatio: 0 },
  { ticker: '030200', name: 'KT',               sector: '통신',         region: '국내', assetClass: 'equity',    currency: 'KRW', price: 46200,   annualReturn: 6.2,  volatility: 15.1, expenseRatio: 0 },
  { ticker: '066570', name: 'LG전자',            sector: '전자·가전',   region: '국내', assetClass: 'equity',    currency: 'KRW', price: 92400,   annualReturn: 5.8,  volatility: 22.4, expenseRatio: 0 },
  { ticker: '012330', name: '현대모비스',        sector: '자동차부품',  region: '국내', assetClass: 'equity',    currency: 'KRW', price: 238000,  annualReturn: 7.0,  volatility: 22.8, expenseRatio: 0 },
  { ticker: '034730', name: 'SK',               sector: '지주회사',    region: '국내', assetClass: 'equity',    currency: 'KRW', price: 138000,  annualReturn: 5.4,  volatility: 19.6, expenseRatio: 0 },
  { ticker: '003550', name: 'LG',               sector: '지주회사',    region: '국내', assetClass: 'equity',    currency: 'KRW', price: 80200,   annualReturn: 5.2,  volatility: 17.8, expenseRatio: 0 },
  { ticker: '015760', name: '한국전력',          sector: '에너지·유틸리티', region: '국내', assetClass: 'equity', currency: 'KRW', price: 24400, annualReturn: 3.4,  volatility: 21.4, expenseRatio: 0 },
  { ticker: '047050', name: '포스코인터내셔널', sector: '무역·유통',   region: '국내', assetClass: 'equity',    currency: 'KRW', price: 64200,   annualReturn: 8.2,  volatility: 24.2, expenseRatio: 0 },
  { ticker: '000810', name: '삼성화재',          sector: '보험',         region: '국내', assetClass: 'equity',    currency: 'KRW', price: 342000,  annualReturn: 7.4,  volatility: 17.6, expenseRatio: 0 },
  { ticker: '010950', name: 'S-Oil',            sector: '에너지',       region: '국내', assetClass: 'equity',    currency: 'KRW', price: 62400,   annualReturn: 5.4,  volatility: 26.3, expenseRatio: 0 },
  { ticker: '009150', name: '삼성전기',          sector: '반도체·전자', region: '국내', assetClass: 'equity',    currency: 'KRW', price: 124000,  annualReturn: 7.4,  volatility: 26.4, expenseRatio: 0 },
  { ticker: '018260', name: '삼성에스디에스',   sector: 'IT서비스',    region: '국내', assetClass: 'equity',    currency: 'KRW', price: 168000,  annualReturn: 6.2,  volatility: 19.2, expenseRatio: 0 },
  { ticker: '032640', name: 'LG유플러스',        sector: '통신',         region: '국내', assetClass: 'equity',    currency: 'KRW', price: 10200,   annualReturn: 4.6,  volatility: 14.4, expenseRatio: 0 },
  { ticker: '000720', name: '현대건설',          sector: '건설',         region: '국내', assetClass: 'equity',    currency: 'KRW', price: 26400,   annualReturn: 4.8,  volatility: 26.8, expenseRatio: 0 },
  { ticker: '011200', name: 'HMM',              sector: '해운',         region: '국내', assetClass: 'equity',    currency: 'KRW', price: 16800,   annualReturn: 6.4,  volatility: 38.4, expenseRatio: 0 },
  { ticker: '323410', name: '카카오뱅크',        sector: '금융·핀테크', region: '국내', assetClass: 'equity',    currency: 'KRW', price: 21800,   annualReturn: 4.0,  volatility: 34.1, expenseRatio: 0 },
  { ticker: '259960', name: '크래프톤',          sector: '게임',         region: '국내', assetClass: 'equity',    currency: 'KRW', price: 328000,  annualReturn: 9.2,  volatility: 32.4, expenseRatio: 0 },
  { ticker: '036570', name: '엔씨소프트',        sector: '게임',         region: '국내', assetClass: 'equity',    currency: 'KRW', price: 168000,  annualReturn: 2.8,  volatility: 31.8, expenseRatio: 0 },
  { ticker: '047810', name: '한국항공우주',      sector: '방산·항공',   region: '국내', assetClass: 'equity',    currency: 'KRW', price: 74800,   annualReturn: 11.4, volatility: 28.6, expenseRatio: 0 },
  { ticker: '012450', name: '한화에어로스페이스', sector: '방산·항공',  region: '국내', assetClass: 'equity',    currency: 'KRW', price: 368000,  annualReturn: 18.4, volatility: 36.8, expenseRatio: 0 },

  // ── KOSDAQ 주요종목 ──────────────────────────────────────────
  { ticker: '086520', name: '에코프로',          sector: '2차전지',      region: '국내', assetClass: 'equity',    currency: 'KRW', price: 58400,   annualReturn: 12.4, volatility: 62.4, expenseRatio: 0 },
  { ticker: '247540', name: '에코프로비엠',      sector: '2차전지',      region: '국내', assetClass: 'equity',    currency: 'KRW', price: 98200,   annualReturn: 10.2, volatility: 56.2, expenseRatio: 0 },
  { ticker: '196170', name: '알테오젠',          sector: '바이오',       region: '국내', assetClass: 'equity',    currency: 'KRW', price: 388000,  annualReturn: 28.4, volatility: 58.6, expenseRatio: 0 },
  { ticker: '028300', name: 'HLB',              sector: '바이오',       region: '국내', assetClass: 'equity',    currency: 'KRW', price: 72400,   annualReturn: 14.8, volatility: 64.8, expenseRatio: 0 },
  { ticker: '293490', name: '카카오게임즈',      sector: '게임',         region: '국내', assetClass: 'equity',    currency: 'KRW', price: 13400,   annualReturn: 2.0,  volatility: 38.4, expenseRatio: 0 },
  { ticker: '112040', name: '위메이드',          sector: '게임',         region: '국내', assetClass: 'equity',    currency: 'KRW', price: 28600,   annualReturn: 3.4,  volatility: 52.6, expenseRatio: 0 },
  { ticker: '145020', name: '휴젤',              sector: '바이오·헬스', region: '국내', assetClass: 'equity',    currency: 'KRW', price: 318000,  annualReturn: 14.2, volatility: 36.8, expenseRatio: 0 },
  { ticker: '214150', name: '클래시스',          sector: '의료기기',     region: '국내', assetClass: 'equity',    currency: 'KRW', price: 46200,   annualReturn: 20.4, volatility: 42.4, expenseRatio: 0 },
  { ticker: '058470', name: '리노공업',          sector: '반도체장비',  region: '국내', assetClass: 'equity',    currency: 'KRW', price: 168000,  annualReturn: 10.8, volatility: 34.2, expenseRatio: 0 },
  { ticker: '054040', name: '차이나그레이트',    sector: '소비재',       region: '국내', assetClass: 'equity',    currency: 'KRW', price: 11200,   annualReturn: 3.8,  volatility: 32.6, expenseRatio: 0 },
  { ticker: '039200', name: '오스코텍',          sector: '바이오',       region: '국내', assetClass: 'equity',    currency: 'KRW', price: 36400,   annualReturn: 8.8,  volatility: 48.4, expenseRatio: 0 },
  { ticker: '041510', name: 'SM엔터테인먼트',   sector: '엔터테인먼트', region: '국내', assetClass: 'equity',    currency: 'KRW', price: 88400,   annualReturn: 8.4,  volatility: 38.6, expenseRatio: 0 },
  { ticker: '035900', name: 'JYP Ent.',         sector: '엔터테인먼트', region: '국내', assetClass: 'equity',    currency: 'KRW', price: 48200,   annualReturn: 7.8,  volatility: 36.4, expenseRatio: 0 },
  { ticker: '122870', name: '와이지엔터테인먼트', sector: '엔터테인먼트', region: '국내', assetClass: 'equity',  currency: 'KRW', price: 42800,   annualReturn: 7.0,  volatility: 38.2, expenseRatio: 0 },
  { ticker: '004370', name: '농심',              sector: '식음료',       region: '국내', assetClass: 'equity',    currency: 'KRW', price: 358000,  annualReturn: 5.8,  volatility: 16.4, expenseRatio: 0 },
  { ticker: '000080', name: '하이트진로',        sector: '식음료',       region: '국내', assetClass: 'equity',    currency: 'KRW', price: 18800,   annualReturn: 4.0,  volatility: 18.6, expenseRatio: 0 },
  { ticker: '271560', name: '오리온',            sector: '식음료',       region: '국내', assetClass: 'equity',    currency: 'KRW', price: 98400,   annualReturn: 6.2,  volatility: 18.2, expenseRatio: 0 },

  // ── 국내 ETF (KODEX / TIGER / ACE / KBSTAR / HANARO) ────────
  { ticker: '069500', name: 'KODEX 200',                  sector: '국내주식',   region: '국내',   assetClass: 'equity',    currency: 'KRW', price: 34200,  annualReturn: 5.8,  volatility: 17.3, expenseRatio: 0.15 },
  { ticker: '102110', name: 'TIGER 200',                  sector: '국내주식',   region: '국내',   assetClass: 'equity',    currency: 'KRW', price: 34280,  annualReturn: 5.8,  volatility: 17.2, expenseRatio: 0.05 },
  { ticker: '229200', name: 'KODEX 코스닥150',            sector: '국내주식',   region: '국내',   assetClass: 'equity',    currency: 'KRW', price: 8960,   annualReturn: 7.2,  volatility: 24.6, expenseRatio: 0.24 },
  { ticker: '233740', name: 'KODEX 코스닥150 레버리지',  sector: '국내주식',   region: '국내',   assetClass: 'equity',    currency: 'KRW', price: 5840,   annualReturn: 12.4, volatility: 46.8, expenseRatio: 0.64 },
  { ticker: '122630', name: 'KODEX 레버리지',             sector: '국내주식',   region: '국내',   assetClass: 'equity',    currency: 'KRW', price: 15680,  annualReturn: 9.8,  volatility: 34.2, expenseRatio: 0.64 },
  { ticker: '114800', name: 'KODEX 인버스',               sector: '인버스',     region: '국내',   assetClass: 'equity',    currency: 'KRW', price: 4120,   annualReturn: -5.8, volatility: 17.1, expenseRatio: 0.64 },
  { ticker: '360750', name: 'TIGER 미국S&P500',           sector: '미국주식',   region: '미국',   assetClass: 'equity',    currency: 'KRW', price: 20480,  annualReturn: 10.5, volatility: 15.4, expenseRatio: 0.07 },
  { ticker: '379800', name: 'KODEX 미국S&P500',           sector: '미국주식',   region: '미국',   assetClass: 'equity',    currency: 'KRW', price: 19240,  annualReturn: 10.5, volatility: 15.4, expenseRatio: 0.02 },
  { ticker: '133690', name: 'TIGER 미국나스닥100',         sector: '미국주식',   region: '미국',   assetClass: 'equity',    currency: 'KRW', price: 120400, annualReturn: 14.3, volatility: 20.5, expenseRatio: 0.49 },
  { ticker: '453810', name: 'KODEX 미국나스닥100',         sector: '미국주식',   region: '미국',   assetClass: 'equity',    currency: 'KRW', price: 18240,  annualReturn: 14.3, volatility: 20.5, expenseRatio: 0.05 },
  { ticker: '195980', name: 'ARIRANG 미국다우존스',       sector: '미국주식',   region: '미국',   assetClass: 'equity',    currency: 'KRW', price: 21200,  annualReturn: 9.8,  volatility: 14.2, expenseRatio: 0.20 },
  { ticker: '453850', name: 'ACE 미국S&P500',             sector: '미국주식',   region: '미국',   assetClass: 'equity',    currency: 'KRW', price: 18480,  annualReturn: 10.5, volatility: 15.4, expenseRatio: 0.07 },
  { ticker: '367380', name: 'KBSTAR 미국S&P500',          sector: '미국주식',   region: '미국',   assetClass: 'equity',    currency: 'KRW', price: 18680,  annualReturn: 10.5, volatility: 15.4, expenseRatio: 0.02 },
  { ticker: '459580', name: 'TIGER 미국배당다우존스',      sector: '미국주식',   region: '미국',   assetClass: 'equity',    currency: 'KRW', price: 14280,  annualReturn: 9.4,  volatility: 14.8, expenseRatio: 0.09 },
  { ticker: '448290', name: 'ACE 미국배당다우존스',        sector: '미국주식',   region: '미국',   assetClass: 'equity',    currency: 'KRW', price: 14080,  annualReturn: 9.4,  volatility: 14.8, expenseRatio: 0.09 },
  { ticker: '438330', name: 'KODEX 미국빅테크10',         sector: '미국주식',   region: '미국',   assetClass: 'equity',    currency: 'KRW', price: 22480,  annualReturn: 18.4, volatility: 26.4, expenseRatio: 0.45 },
  { ticker: '381170', name: 'TIGER 차이나전기차SOLACTIVE', sector: '중국주식',  region: '중국',   assetClass: 'equity',    currency: 'KRW', price: 8640,   annualReturn: 5.2,  volatility: 36.8, expenseRatio: 0.49 },
  { ticker: '200250', name: 'KODEX 일본TOPIX100',         sector: '일본주식',   region: '일본',   assetClass: 'equity',    currency: 'KRW', price: 14280,  annualReturn: 7.8,  volatility: 18.6, expenseRatio: 0.35 },
  { ticker: '195820', name: 'KODEX 유럽',                 sector: '유럽주식',   region: '유럽',   assetClass: 'equity',    currency: 'KRW', price: 15400,  annualReturn: 7.2,  volatility: 17.4, expenseRatio: 0.30 },
  { ticker: '130680', name: 'TIGER 국채3년',              sector: '채권',       region: '국내',   assetClass: 'bond',      currency: 'KRW', price: 104200, annualReturn: 3.2,  volatility: 1.8,  expenseRatio: 0.05 },
  { ticker: '305080', name: 'TIGER 미국채10년선물',       sector: '채권',       region: '미국',   assetClass: 'bond',      currency: 'KRW', price: 9180,   annualReturn: 3.6,  volatility: 8.2,  expenseRatio: 0.29 },
  { ticker: '453820', name: 'ACE 미국30년국채액티브',     sector: '채권',       region: '미국',   assetClass: 'bond',      currency: 'KRW', price: 8840,   annualReturn: 4.0,  volatility: 13.8, expenseRatio: 0.05 },
  { ticker: '448730', name: 'KODEX 미국채울트라30년선물', sector: '채권',       region: '미국',   assetClass: 'bond',      currency: 'KRW', price: 7280,   annualReturn: 4.4,  volatility: 18.4, expenseRatio: 0.35 },
  { ticker: '114260', name: 'KODEX 국고채10년',           sector: '채권',       region: '국내',   assetClass: 'bond',      currency: 'KRW', price: 114200, annualReturn: 3.0,  volatility: 3.8,  expenseRatio: 0.15 },
  { ticker: '273130', name: 'KODEX 단기채권PLUS',         sector: '채권',       region: '국내',   assetClass: 'bond',      currency: 'KRW', price: 104800, annualReturn: 3.6,  volatility: 0.8,  expenseRatio: 0.07 },
  { ticker: '132030', name: 'KODEX 골드선물(H)',          sector: '원자재',     region: '글로벌', assetClass: 'commodity', currency: 'KRW', price: 17200,  annualReturn: 8.4,  volatility: 14.2, expenseRatio: 0.68 },
  { ticker: '411060', name: 'ACE 금현물',                 sector: '원자재',     region: '글로벌', assetClass: 'commodity', currency: 'KRW', price: 17800,  annualReturn: 8.6,  volatility: 14.0, expenseRatio: 0.40 },
  { ticker: '427120', name: 'TIGER 금현물',               sector: '원자재',     region: '글로벌', assetClass: 'commodity', currency: 'KRW', price: 17640,  annualReturn: 8.6,  volatility: 14.0, expenseRatio: 0.39 },
  { ticker: '319870', name: 'TIGER 원유선물Enhanced(H)',  sector: '원자재',     region: '글로벌', assetClass: 'commodity', currency: 'KRW', price: 6480,   annualReturn: 3.8,  volatility: 32.4, expenseRatio: 0.69 },
  { ticker: '396520', name: 'TIGER 리츠부동산인프라',     sector: '리츠',       region: '국내',   assetClass: 'equity',    currency: 'KRW', price: 4480,   annualReturn: 6.2,  volatility: 12.6, expenseRatio: 0.29 },
  { ticker: '352560', name: 'TIGER 글로벌리츠(합성H)',    sector: '리츠',       region: '글로벌', assetClass: 'equity',    currency: 'KRW', price: 8640,   annualReturn: 6.6,  volatility: 14.8, expenseRatio: 0.34 },
  { ticker: '161510', name: 'PLUS 고배당주 (구 ARIRANG 고배당주)', sector: '국내배당', region: '국내', assetClass: 'equity', currency: 'KRW', price: 14200, annualReturn: 7.8, volatility: 15.8, expenseRatio: 0.23 },
  { ticker: '091160', name: 'KODEX 반도체',               sector: '반도체',     region: '국내',   assetClass: 'equity',    currency: 'KRW', price: 44800,  annualReturn: 9.2,  volatility: 28.6, expenseRatio: 0.45 },
  { ticker: '395160', name: 'TIGER 미국필라델피아반도체나스닥', sector: '반도체', region: '미국', assetClass: 'equity',    currency: 'KRW', price: 28400,  annualReturn: 16.4, volatility: 30.4, expenseRatio: 0.49 },
  { ticker: '364980', name: 'TIGER 글로벌클라우드컴퓨팅INDXX', sector: 'IT·테크', region: '글로벌', assetClass: 'equity', currency: 'KRW', price: 14280,  annualReturn: 12.8, volatility: 26.8, expenseRatio: 0.49 },

  // ── 해외 ETF (USD) ──────────────────────────────────────────
  { ticker: 'SPY',  name: 'SPDR S&P 500 ETF',                     sector: '미국주식',   region: '미국',   assetClass: 'equity',    currency: 'USD', price: 558,   annualReturn: 10.7, volatility: 15.2, expenseRatio: 0.09 },
  { ticker: 'VOO',  name: '뱅가드 S&P 500 ETF',                  sector: '미국주식',   region: '미국',   assetClass: 'equity',    currency: 'USD', price: 513,   annualReturn: 10.7, volatility: 15.2, expenseRatio: 0.03 },
  { ticker: 'IVV',  name: '아이쉐어즈 S&P 500 ETF',              sector: '미국주식',   region: '미국',   assetClass: 'equity',    currency: 'USD', price: 563,   annualReturn: 10.7, volatility: 15.2, expenseRatio: 0.03 },
  { ticker: 'QQQ',  name: '인베스코 QQQ 나스닥 100 ETF',         sector: '미국주식',   region: '미국',   assetClass: 'equity',    currency: 'USD', price: 488,   annualReturn: 14.3, volatility: 20.1, expenseRatio: 0.20 },
  { ticker: 'QQQM', name: '인베스코 QQQ 나스닥 100 ETF(미니)',   sector: '미국주식',   region: '미국',   assetClass: 'equity',    currency: 'USD', price: 207,   annualReturn: 14.3, volatility: 20.1, expenseRatio: 0.15 },
  { ticker: 'VTI',  name: '뱅가드 토탈 스톡마켓 ETF',            sector: '미국주식',   region: '미국',   assetClass: 'equity',    currency: 'USD', price: 278,   annualReturn: 10.4, volatility: 15.6, expenseRatio: 0.03 },
  { ticker: 'VT',   name: '뱅가드 토탈 월드 스톡 ETF',           sector: '글로벌주식', region: '글로벌', assetClass: 'equity',    currency: 'USD', price: 113,   annualReturn: 8.9,  volatility: 15.6, expenseRatio: 0.07 },
  { ticker: 'VEA',  name: '뱅가드 FTSE 선진시장 ETF',            sector: '글로벌주식', region: '글로벌', assetClass: 'equity',    currency: 'USD', price: 53,    annualReturn: 7.2,  volatility: 16.4, expenseRatio: 0.05 },
  { ticker: 'VWO',  name: '뱅가드 FTSE 신흥시장 ETF',            sector: '신흥국주식', region: '글로벌', assetClass: 'equity',    currency: 'USD', price: 46,    annualReturn: 6.4,  volatility: 19.8, expenseRatio: 0.08 },
  { ticker: 'EEM',  name: '아이쉐어즈 MSCI 신흥국 ETF',          sector: '신흥국주식', region: '글로벌', assetClass: 'equity',    currency: 'USD', price: 44,    annualReturn: 6.2,  volatility: 20.1, expenseRatio: 0.70 },
  { ticker: 'SCHD', name: '슈왑 미국 배당주 ETF',                sector: '미국주식',   region: '미국',   assetClass: 'equity',    currency: 'USD', price: 84,    annualReturn: 10.2, volatility: 13.8, expenseRatio: 0.06 },
  { ticker: 'VYM',  name: '뱅가드 고배당수익률 ETF',              sector: '미국주식',   region: '미국',   assetClass: 'equity',    currency: 'USD', price: 129,   annualReturn: 9.4,  volatility: 13.2, expenseRatio: 0.06 },
  { ticker: 'VIG',  name: '뱅가드 배당성장 ETF',                 sector: '미국주식',   region: '미국',   assetClass: 'equity',    currency: 'USD', price: 202,   annualReturn: 10.6, volatility: 13.4, expenseRatio: 0.06 },
  { ticker: 'DVY',  name: '아이쉐어즈 셀렉트 배당 ETF',           sector: '미국주식',   region: '미국',   assetClass: 'equity',    currency: 'USD', price: 130,   annualReturn: 9.2,  volatility: 14.8, expenseRatio: 0.38 },
  { ticker: 'HDV',  name: '아이쉐어즈 코어 고배당 ETF',           sector: '미국주식',   region: '미국',   assetClass: 'equity',    currency: 'USD', price: 110,   annualReturn: 8.8,  volatility: 12.4, expenseRatio: 0.08 },
  { ticker: 'SPYD', name: 'SPDR S&P 500 고배당 ETF',             sector: '미국주식',   region: '미국',   assetClass: 'equity',    currency: 'USD', price: 44,    annualReturn: 8.4,  volatility: 14.6, expenseRatio: 0.07 },
  { ticker: 'JEPI', name: 'JP모건 이퀴티 프리미엄 인컴 ETF',      sector: '미국주식',   region: '미국',   assetClass: 'equity',    currency: 'USD', price: 58,    annualReturn: 8.6,  volatility: 10.4, expenseRatio: 0.35 },
  { ticker: 'JEPQ', name: 'JP모건 나스닥 이퀴티 프리미엄 인컴 ETF', sector: '미국주식', region: '미국',   assetClass: 'equity',    currency: 'USD', price: 56,    annualReturn: 9.8,  volatility: 12.4, expenseRatio: 0.35 },
  { ticker: 'DGRW', name: '위즈덤트리 미국 배당성장 ETF',         sector: '미국주식',   region: '미국',   assetClass: 'equity',    currency: 'USD', price: 71,    annualReturn: 10.8, volatility: 14.2, expenseRatio: 0.28 },
  { ticker: 'SCHY', name: '슈왑 인터내셔널 배당주 ETF',           sector: '글로벌주식', region: '글로벌', assetClass: 'equity',    currency: 'USD', price: 25,    annualReturn: 7.8,  volatility: 14.4, expenseRatio: 0.14 },
  { ticker: 'QYLD', name: '글로벌 X 나스닥 100 커버드콜 ETF',    sector: '미국주식',   region: '미국',   assetClass: 'equity',    currency: 'USD', price: 17,    annualReturn: 7.8,  volatility: 12.6, expenseRatio: 0.60 },
  { ticker: 'ARKK', name: 'ARK 이노베이션 ETF',                  sector: 'IT·테크',    region: '미국',   assetClass: 'equity',    currency: 'USD', price: 58,    annualReturn: 6.4,  volatility: 48.2, expenseRatio: 0.75 },
  { ticker: 'TLT',  name: '아이쉐어즈 미국채 20년+ ETF',          sector: '채권',       region: '미국',   assetClass: 'bond',      currency: 'USD', price: 87,    annualReturn: 4.2,  volatility: 13.8, expenseRatio: 0.15 },
  { ticker: 'IEF',  name: '아이쉐어즈 미국채 7-10년 ETF',         sector: '채권',       region: '미국',   assetClass: 'bond',      currency: 'USD', price: 92,    annualReturn: 3.2,  volatility: 6.8,  expenseRatio: 0.15 },
  { ticker: 'AGG',  name: '아이쉐어즈 코어 미국 채권 ETF',        sector: '채권',       region: '미국',   assetClass: 'bond',      currency: 'USD', price: 96,    annualReturn: 3.4,  volatility: 5.2,  expenseRatio: 0.03 },
  { ticker: 'BND',  name: '뱅가드 토탈 채권 마켓 ETF',            sector: '채권',       region: '미국',   assetClass: 'bond',      currency: 'USD', price: 72,    annualReturn: 3.2,  volatility: 5.4,  expenseRatio: 0.03 },
  { ticker: 'HYG',  name: '아이쉐어즈 iBoxx 하이일드 회사채 ETF', sector: '채권',       region: '미국',   assetClass: 'bond',      currency: 'USD', price: 79,    annualReturn: 5.4,  volatility: 8.6,  expenseRatio: 0.48 },
  { ticker: 'GLD',  name: 'SPDR 골드 쉐어스 ETF',                sector: '원자재',     region: '글로벌', assetClass: 'commodity', currency: 'USD', price: 250,   annualReturn: 8.4,  volatility: 14.2, expenseRatio: 0.40 },
  { ticker: 'IAU',  name: '아이쉐어즈 골드 트러스트 ETF',          sector: '원자재',     region: '글로벌', assetClass: 'commodity', currency: 'USD', price: 50,    annualReturn: 8.4,  volatility: 14.2, expenseRatio: 0.25 },
  { ticker: 'SLV',  name: '아이쉐어즈 실버 트러스트 ETF',          sector: '원자재',     region: '글로벌', assetClass: 'commodity', currency: 'USD', price: 30,    annualReturn: 6.2,  volatility: 22.6, expenseRatio: 0.50 },
  { ticker: 'VNQ',  name: '뱅가드 부동산 ETF',                    sector: '리츠',       region: '미국',   assetClass: 'equity',    currency: 'USD', price: 87,    annualReturn: 7.2,  volatility: 16.4, expenseRatio: 0.12 },

  // ── 미국 성장·테마 ETF ─────────────────────────────────────
  { ticker: 'SCHG', name: '슈왑 미국 대형 성장주 ETF',               sector: '미국주식',   region: '미국',   assetClass: 'equity',    currency: 'USD', price: 102,   annualReturn: 15.2, volatility: 20.8, expenseRatio: 0.04 },
  { ticker: 'VUG',  name: '뱅가드 성장 ETF',                        sector: '미국주식',   region: '미국',   assetClass: 'equity',    currency: 'USD', price: 382,   annualReturn: 14.6, volatility: 20.4, expenseRatio: 0.04 },
  { ticker: 'IWF',  name: '아이쉐어즈 러셀 1000 성장 ETF',          sector: '미국주식',   region: '미국',   assetClass: 'equity',    currency: 'USD', price: 364,   annualReturn: 14.8, volatility: 20.6, expenseRatio: 0.19 },
  { ticker: 'IWM',  name: '아이쉐어즈 러셀 2000 소형주 ETF',        sector: '미국주식',   region: '미국',   assetClass: 'equity',    currency: 'USD', price: 218,   annualReturn: 9.2,  volatility: 21.4, expenseRatio: 0.19 },
  { ticker: 'IJR',  name: '아이쉐어즈 코어 S&P 소형주 ETF',         sector: '미국주식',   region: '미국',   assetClass: 'equity',    currency: 'USD', price: 118,   annualReturn: 9.8,  volatility: 20.8, expenseRatio: 0.06 },
  { ticker: 'AVUV', name: '어밴티스 미국 소형 가치주 ETF',           sector: '미국주식',   region: '미국',   assetClass: 'equity',    currency: 'USD', price: 98,    annualReturn: 11.4, volatility: 22.6, expenseRatio: 0.25 },
  { ticker: 'TQQQ', name: '프로쉐어즈 울트라프로 QQQ ETF',           sector: '미국주식',   region: '미국',   assetClass: 'equity',    currency: 'USD', price: 62,    annualReturn: 28.6, volatility: 58.4, expenseRatio: 0.88 },
  { ticker: 'UPRO', name: '프로쉐어즈 울트라프로 S&P 500 ETF',       sector: '미국주식',   region: '미국',   assetClass: 'equity',    currency: 'USD', price: 84,    annualReturn: 24.2, volatility: 46.8, expenseRatio: 0.91 },
  { ticker: 'SOXL', name: '디렉시온 반도체 불 3X ETF',               sector: '반도체',     region: '미국',   assetClass: 'equity',    currency: 'USD', price: 42,    annualReturn: 32.4, volatility: 86.4, expenseRatio: 0.76 },
  { ticker: 'XYLD', name: '글로벌 X S&P 500 커버드콜 ETF',           sector: '미국주식',   region: '미국',   assetClass: 'equity',    currency: 'USD', price: 42,    annualReturn: 8.2,  volatility: 11.6, expenseRatio: 0.60 },
  { ticker: 'DIVO', name: '앰플리파이 CWP 고배당성장 ETF',            sector: '미국주식',   region: '미국',   assetClass: 'equity',    currency: 'USD', price: 42,    annualReturn: 9.8,  volatility: 12.4, expenseRatio: 0.55 },
  { ticker: 'DGRO', name: '아이쉐어즈 코어 배당성장 ETF',             sector: '미국주식',   region: '미국',   assetClass: 'equity',    currency: 'USD', price: 60,    annualReturn: 10.4, volatility: 13.2, expenseRatio: 0.08 },
  { ticker: 'NOBL', name: '프로쉐어즈 S&P 500 배당귀족 ETF',         sector: '미국주식',   region: '미국',   assetClass: 'equity',    currency: 'USD', price: 96,    annualReturn: 10.2, volatility: 13.8, expenseRatio: 0.35 },
  { ticker: 'COWZ', name: '페이서 미국 캐시카우 100 ETF',             sector: '미국주식',   region: '미국',   assetClass: 'equity',    currency: 'USD', price: 60,    annualReturn: 12.4, volatility: 16.4, expenseRatio: 0.49 },
  { ticker: 'VXUS', name: '뱅가드 토탈 인터내셔널 스톡 ETF',         sector: '글로벌주식', region: '글로벌', assetClass: 'equity',    currency: 'USD', price: 62,    annualReturn: 7.4,  volatility: 16.8, expenseRatio: 0.07 },
  { ticker: 'ACWI', name: '아이쉐어즈 MSCI ACWI ETF',                sector: '글로벌주식', region: '글로벌', assetClass: 'equity',    currency: 'USD', price: 112,   annualReturn: 9.2,  volatility: 15.6, expenseRatio: 0.32 },
  { ticker: 'ACWX', name: '아이쉐어즈 MSCI ACWI ex US ETF',          sector: '글로벌주식', region: '글로벌', assetClass: 'equity',    currency: 'USD', price: 52,    annualReturn: 7.1,  volatility: 16.2, expenseRatio: 0.32 },

  // ── 섹터 & 테마 ETF ────────────────────────────────────────
  { ticker: 'BOTZ', name: '글로벌 X 로보틱스 & 인공지능 ETF',        sector: 'AI·로봇',    region: '글로벌', assetClass: 'equity',    currency: 'USD', price: 32,    annualReturn: 14.2, volatility: 28.6, expenseRatio: 0.68 },
  { ticker: 'AIQ',  name: '글로벌 X 인공지능 & 테크놀로지 ETF',    sector: 'AI·로봇',    region: '글로벌', assetClass: 'equity',    currency: 'USD', price: 38,    annualReturn: 13.8, volatility: 26.4, expenseRatio: 0.68 },
  { ticker: 'ROBO', name: 'ROBO 글로벌 로보틱스 & 자동화 ETF',     sector: 'AI·로봇',    region: '글로벌', assetClass: 'equity',    currency: 'USD', price: 58,    annualReturn: 10.6, volatility: 24.8, expenseRatio: 0.95 },
  { ticker: 'SOXX', name: '아이쉐어즈 반도체 ETF',                  sector: '반도체',     region: '미국',   assetClass: 'equity',    currency: 'USD', price: 234,   annualReturn: 18.4, volatility: 32.6, expenseRatio: 0.35 },
  { ticker: 'SMH',  name: '반에크 반도체 ETF',                      sector: '반도체',     region: '미국',   assetClass: 'equity',    currency: 'USD', price: 242,   annualReturn: 20.2, volatility: 33.8, expenseRatio: 0.35 },
  { ticker: 'CIBR', name: '퍼스트트러스트 나스닥 사이버보안 ETF',   sector: '사이버보안', region: '미국',   assetClass: 'equity',    currency: 'USD', price: 62,    annualReturn: 14.6, volatility: 24.2, expenseRatio: 0.60 },
  { ticker: 'HACK', name: 'ETFMG 프라임 사이버보안 ETF',            sector: '사이버보안', region: '미국',   assetClass: 'equity',    currency: 'USD', price: 66,    annualReturn: 12.8, volatility: 22.6, expenseRatio: 0.60 },
  { ticker: 'CLOU', name: '글로벌 X 클라우드 컴퓨팅 ETF',           sector: '클라우드',   region: '미국',   assetClass: 'equity',    currency: 'USD', price: 24,    annualReturn: 11.6, volatility: 26.4, expenseRatio: 0.68 },
  { ticker: 'DRIV', name: '글로벌 X 자율주행 & 전기차 ETF',         sector: '자동차·EV',  region: '글로벌', assetClass: 'equity',    currency: 'USD', price: 26,    annualReturn: 8.4,  volatility: 22.4, expenseRatio: 0.68 },
  { ticker: 'LIT',  name: '글로벌 X 리튬 & 배터리 테크 ETF',        sector: '2차전지',    region: '글로벌', assetClass: 'equity',    currency: 'USD', price: 36,    annualReturn: 6.8,  volatility: 32.6, expenseRatio: 0.75 },
  { ticker: 'ICLN', name: '아이쉐어즈 글로벌 클린 에너지 ETF',      sector: '클린에너지', region: '글로벌', assetClass: 'equity',    currency: 'USD', price: 14,    annualReturn: 4.2,  volatility: 28.4, expenseRatio: 0.40 },
  { ticker: 'PAVE', name: '글로벌 X 미국 인프라 개발 ETF',          sector: '인프라',     region: '미국',   assetClass: 'equity',    currency: 'USD', price: 42,    annualReturn: 13.4, volatility: 18.4, expenseRatio: 0.47 },
  { ticker: 'XLK',  name: 'Technology Select Sector SPDR ETF',      sector: 'IT·테크',    region: '미국',   assetClass: 'equity',    currency: 'USD', price: 234,   annualReturn: 16.4, volatility: 22.6, expenseRatio: 0.09 },
  { ticker: 'XLF',  name: 'Financial Select Sector SPDR ETF',       sector: '금융',       region: '미국',   assetClass: 'equity',    currency: 'USD', price: 48,    annualReturn: 10.8, volatility: 18.4, expenseRatio: 0.09 },
  { ticker: 'XLE',  name: 'Energy Select Sector SPDR ETF',          sector: '에너지',     region: '미국',   assetClass: 'equity',    currency: 'USD', price: 94,    annualReturn: 9.6,  volatility: 24.8, expenseRatio: 0.09 },
  { ticker: 'XLV',  name: 'Health Care Select Sector SPDR ETF',     sector: '헬스케어',   region: '미국',   assetClass: 'equity',    currency: 'USD', price: 148,   annualReturn: 9.4,  volatility: 14.6, expenseRatio: 0.09 },
  { ticker: 'XLU',  name: 'Utilities Select Sector SPDR ETF',       sector: '유틸리티',   region: '미국',   assetClass: 'equity',    currency: 'USD', price: 72,    annualReturn: 7.2,  volatility: 12.4, expenseRatio: 0.09 },
  { ticker: 'XLRE', name: 'Real Estate Select Sector SPDR ETF',     sector: '리츠',       region: '미국',   assetClass: 'equity',    currency: 'USD', price: 42,    annualReturn: 7.4,  volatility: 14.2, expenseRatio: 0.09 },
  { ticker: 'IBB',  name: '아이쉐어즈 나스닥 바이오테크놀로지 ETF', sector: '바이오',     region: '미국',   assetClass: 'equity',    currency: 'USD', price: 128,   annualReturn: 8.6,  volatility: 22.4, expenseRatio: 0.45 },
  { ticker: 'XBI',  name: 'SPDR S&P 바이오테크 ETF',                sector: '바이오',     region: '미국',   assetClass: 'equity',    currency: 'USD', price: 98,    annualReturn: 7.4,  volatility: 28.6, expenseRatio: 0.35 },

  // ── 국가별 ETF (해외) ──────────────────────────────────────
  { ticker: 'EWJ',  name: '아이쉐어즈 MSCI 일본 ETF',             sector: '일본주식',   region: '일본',   assetClass: 'equity',    currency: 'USD', price: 68,    annualReturn: 7.4,  volatility: 16.8, expenseRatio: 0.50 },
  { ticker: 'EWG',  name: '아이쉐어즈 MSCI 독일 ETF',             sector: '유럽주식',   region: '유럽',   assetClass: 'equity',    currency: 'USD', price: 32,    annualReturn: 7.2,  volatility: 18.4, expenseRatio: 0.50 },
  { ticker: 'EWU',  name: '아이쉐어즈 MSCI 영국 ETF',             sector: '유럽주식',   region: '유럽',   assetClass: 'equity',    currency: 'USD', price: 34,    annualReturn: 6.8,  volatility: 16.4, expenseRatio: 0.50 },
  { ticker: 'EWY',  name: '아이쉐어즈 MSCI 한국 ETF',             sector: '국내주식',   region: '국내',   assetClass: 'equity',    currency: 'USD', price: 56,    annualReturn: 5.4,  volatility: 22.6, expenseRatio: 0.57 },
  { ticker: 'FXI',  name: '아이쉐어즈 중국 대형주 ETF',            sector: '중국주식',   region: '중국',   assetClass: 'equity',    currency: 'USD', price: 26,    annualReturn: 3.2,  volatility: 26.4, expenseRatio: 0.74 },
  { ticker: 'MCHI', name: '아이쉐어즈 MSCI 중국 ETF',              sector: '중국주식',   region: '중국',   assetClass: 'equity',    currency: 'USD', price: 42,    annualReturn: 3.8,  volatility: 24.6, expenseRatio: 0.59 },
  { ticker: 'INDA', name: '아이쉐어즈 MSCI 인도 ETF',              sector: '인도주식',   region: '인도',   assetClass: 'equity',    currency: 'USD', price: 56,    annualReturn: 12.4, volatility: 22.8, expenseRatio: 0.64 },
  { ticker: 'EWZ',  name: '아이쉐어즈 MSCI 브라질 ETF',            sector: '신흥국주식', region: '글로벌', assetClass: 'equity',    currency: 'USD', price: 30,    annualReturn: 5.4,  volatility: 30.4, expenseRatio: 0.59 },
  { ticker: 'EWT',  name: '아이쉐어즈 MSCI 대만 ETF',              sector: '대만주식',   region: '대만',   assetClass: 'equity',    currency: 'USD', price: 48,    annualReturn: 10.4, volatility: 24.6, expenseRatio: 0.57 },
  { ticker: 'DXJ',  name: '위즈덤트리 일본 헤지드 이쿼티 ETF',     sector: '일본주식',   region: '일본',   assetClass: 'equity',    currency: 'USD', price: 92,    annualReturn: 8.6,  volatility: 16.4, expenseRatio: 0.48 },

  // ── 채권·원자재 추가 ETF ───────────────────────────────────
  { ticker: 'TIPS', name: '아이쉐어즈 미국 물가연동채 ETF',             sector: '채권',       region: '미국',   assetClass: 'bond',      currency: 'USD', price: 110,   annualReturn: 3.8,  volatility: 5.4,  expenseRatio: 0.19 },
  { ticker: 'LQD',  name: '아이쉐어즈 iBoxx 투자등급 회사채 ETF',     sector: '채권',       region: '미국',   assetClass: 'bond',      currency: 'USD', price: 108,   annualReturn: 4.2,  volatility: 7.2,  expenseRatio: 0.14 },
  { ticker: 'DBC',  name: '인베스코 DB 원자재 인덱스 트래킹 ETF',      sector: '원자재',     region: '글로벌', assetClass: 'commodity', currency: 'USD', price: 24,    annualReturn: 5.2,  volatility: 18.4, expenseRatio: 0.87 },
  { ticker: 'USO',  name: '미국 원유 ETF(USO)',                         sector: '원자재',     region: '글로벌', assetClass: 'commodity', currency: 'USD', price: 72,    annualReturn: 4.8,  volatility: 32.4, expenseRatio: 0.81 },
  { ticker: 'PDBC', name: '인베스코 옵티머 일드 디버시파이드 원자재 ETF', sector: '원자재',   region: '글로벌', assetClass: 'commodity', currency: 'USD', price: 14,    annualReturn: 5.6,  volatility: 20.4, expenseRatio: 0.59 },

  // ── 미국 개별주식 ──────────────────────────────────────────
  { ticker: 'AAPL', name: '애플',                          sector: 'IT·테크',    region: '미국',   assetClass: 'equity',    currency: 'USD', price: 208,   annualReturn: 14.2, volatility: 22.4, expenseRatio: 0 },
  { ticker: 'MSFT', name: '마이크로소프트',                sector: 'IT·테크',    region: '미국',   assetClass: 'equity',    currency: 'USD', price: 428,   annualReturn: 16.8, volatility: 21.6, expenseRatio: 0 },
  { ticker: 'GOOGL',name: '알파벳(구글)',                  sector: 'IT·테크',    region: '미국',   assetClass: 'equity',    currency: 'USD', price: 186,   annualReturn: 14.6, volatility: 24.2, expenseRatio: 0 },
  { ticker: 'AMZN', name: '아마존닷컴',                    sector: 'IT·테크',    region: '미국',   assetClass: 'equity',    currency: 'USD', price: 218,   annualReturn: 18.4, volatility: 26.8, expenseRatio: 0 },
  { ticker: 'NVDA', name: '엔비디아',                      sector: '반도체',     region: '미국',   assetClass: 'equity',    currency: 'USD', price: 124,   annualReturn: 42.6, volatility: 48.4, expenseRatio: 0 },
  { ticker: 'META', name: '메타 플랫폼스',                 sector: 'IT·테크',    region: '미국',   assetClass: 'equity',    currency: 'USD', price: 605,   annualReturn: 24.8, volatility: 32.6, expenseRatio: 0 },
  { ticker: 'TSLA', name: '테슬라',                        sector: '자동차·EV',  region: '미국',   assetClass: 'equity',    currency: 'USD', price: 295,   annualReturn: 12.4, volatility: 58.4, expenseRatio: 0 },
  { ticker: 'AVGO', name: '브로드컴',                      sector: '반도체',     region: '미국',   assetClass: 'equity',    currency: 'USD', price: 168,   annualReturn: 22.4, volatility: 34.2, expenseRatio: 0 },
  { ticker: 'JPM',  name: 'JP모건 체이스',                 sector: '금융',       region: '미국',   assetClass: 'equity',    currency: 'USD', price: 238,   annualReturn: 12.8, volatility: 22.6, expenseRatio: 0 },
  { ticker: 'V',    name: '비자',                          sector: '금융',       region: '미국',   assetClass: 'equity',    currency: 'USD', price: 322,   annualReturn: 12.4, volatility: 18.4, expenseRatio: 0 },
  { ticker: 'MA',   name: '마스터카드',                    sector: '금융',       region: '미국',   assetClass: 'equity',    currency: 'USD', price: 542,   annualReturn: 13.2, volatility: 18.8, expenseRatio: 0 },
  { ticker: 'UNH',  name: '유나이티드헬스 그룹',           sector: '헬스케어',   region: '미국',   assetClass: 'equity',    currency: 'USD', price: 538,   annualReturn: 14.6, volatility: 18.2, expenseRatio: 0 },
  { ticker: 'JNJ',  name: '존슨앤드존슨',                  sector: '헬스케어',   region: '미국',   assetClass: 'equity',    currency: 'USD', price: 162,   annualReturn: 7.4,  volatility: 13.8, expenseRatio: 0 },
  { ticker: 'LLY',  name: '일라이 릴리',                   sector: '헬스케어',   region: '미국',   assetClass: 'equity',    currency: 'USD', price: 868,   annualReturn: 28.6, volatility: 32.4, expenseRatio: 0 },
  { ticker: 'PG',   name: '프록터앤드갬블',                sector: '소비재',     region: '미국',   assetClass: 'equity',    currency: 'USD', price: 175,   annualReturn: 8.4,  volatility: 12.6, expenseRatio: 0 },
  { ticker: 'HD',   name: '홈 디포',                       sector: '소비재',     region: '미국',   assetClass: 'equity',    currency: 'USD', price: 408,   annualReturn: 11.6, volatility: 18.4, expenseRatio: 0 },
  { ticker: 'KO',   name: '코카콜라',                      sector: '식음료',     region: '미국',   assetClass: 'equity',    currency: 'USD', price: 68,    annualReturn: 7.2,  volatility: 12.4, expenseRatio: 0 },
  { ticker: 'PEP',  name: '펩시코',                        sector: '식음료',     region: '미국',   assetClass: 'equity',    currency: 'USD', price: 158,   annualReturn: 8.4,  volatility: 13.2, expenseRatio: 0 },
  { ticker: 'NFLX', name: '넷플릭스',                      sector: '미디어',     region: '미국',   assetClass: 'equity',    currency: 'USD', price: 838,   annualReturn: 22.4, volatility: 38.6, expenseRatio: 0 },
  { ticker: 'DIS',  name: '월트 디즈니',                   sector: '미디어',     region: '미국',   assetClass: 'equity',    currency: 'USD', price: 105,   annualReturn: 5.8,  volatility: 26.4, expenseRatio: 0 },
  { ticker: 'AMD',  name: 'AMD',                           sector: '반도체',     region: '미국',   assetClass: 'equity',    currency: 'USD', price: 142,   annualReturn: 24.6, volatility: 46.8, expenseRatio: 0 },
  { ticker: 'INTC', name: '인텔',                           sector: '반도체',     region: '미국',   assetClass: 'equity',    currency: 'USD', price: 24,    annualReturn: 2.4,  volatility: 36.8, expenseRatio: 0 },
  { ticker: 'QCOM', name: '퀄컴',                           sector: '반도체',     region: '미국',   assetClass: 'equity',    currency: 'USD', price: 172,   annualReturn: 12.4, volatility: 28.6, expenseRatio: 0 },
  { ticker: 'ADBE', name: '어도비',                         sector: 'IT·소프트웨어', region: '미국', assetClass: 'equity',  currency: 'USD', price: 448,   annualReturn: 14.8, volatility: 28.4, expenseRatio: 0 },
  { ticker: 'CRM',  name: '세일즈포스',                     sector: 'IT·소프트웨어', region: '미국', assetClass: 'equity',  currency: 'USD', price: 328,   annualReturn: 13.6, volatility: 28.6, expenseRatio: 0 },
  { ticker: 'ORCL', name: '오라클',                         sector: 'IT·소프트웨어', region: '미국', assetClass: 'equity',  currency: 'USD', price: 178,   annualReturn: 14.2, volatility: 22.4, expenseRatio: 0 },
  { ticker: 'BRK.B',name: '버크셔 해서웨이 B',             sector: '금융',       region: '미국',   assetClass: 'equity',    currency: 'USD', price: 478,   annualReturn: 11.4, volatility: 16.4, expenseRatio: 0 },
  { ticker: 'XOM',  name: '엑슨모빌',                       sector: '에너지',     region: '미국',   assetClass: 'equity',    currency: 'USD', price: 114,   annualReturn: 8.4,  volatility: 22.6, expenseRatio: 0 },
  { ticker: 'WMT',  name: '월마트',                         sector: '유통',       region: '미국',   assetClass: 'equity',    currency: 'USD', price: 92,    annualReturn: 10.8, volatility: 14.6, expenseRatio: 0 },
  { ticker: 'TSM',  name: 'TSMC(대만반도체제조)',           sector: '반도체',     region: '대만',   assetClass: 'equity',    currency: 'USD', price: 188,   annualReturn: 16.4, volatility: 32.4, expenseRatio: 0 },
  { ticker: 'PLTR', name: '팔란티어 테크놀로지스',          sector: 'AI·데이터', region: '미국',   assetClass: 'equity',    currency: 'USD', price: 58,    annualReturn: 18.4, volatility: 52.6, expenseRatio: 0 },
  { ticker: 'SNOW', name: '스노우플레이크',                  sector: '클라우드',   region: '미국',   assetClass: 'equity',    currency: 'USD', price: 138,   annualReturn: 12.4, volatility: 48.4, expenseRatio: 0 },
  { ticker: 'SHOP', name: '쇼피파이',                       sector: 'IT·소프트웨어', region: '캐나다', assetClass: 'equity', currency: 'USD', price: 88,    annualReturn: 14.2, volatility: 44.6, expenseRatio: 0 },
  { ticker: 'COIN', name: '코인베이스 글로벌',              sector: '핀테크',     region: '미국',   assetClass: 'equity',    currency: 'USD', price: 248,   annualReturn: 16.8, volatility: 82.4, expenseRatio: 0 },
  { ticker: 'MSTR', name: '마이크로스트래티지',             sector: '핀테크',     region: '미국',   assetClass: 'equity',    currency: 'USD', price: 368,   annualReturn: 42.4, volatility: 96.4, expenseRatio: 0 },
  { ticker: 'IONQ', name: 'IonQ(양자컴퓨팅)',              sector: '양자컴퓨팅', region: '미국',   assetClass: 'equity',    currency: 'USD', price: 38,    annualReturn: 22.4, volatility: 84.6, expenseRatio: 0 },
  { ticker: 'RGTI', name: '리게티 컴퓨팅',                  sector: '양자컴퓨팅', region: '미국',   assetClass: 'equity',    currency: 'USD', price: 15,    annualReturn: 18.4, volatility: 96.4, expenseRatio: 0 },
  { ticker: 'CRWD', name: '크라우드스트라이크 홀딩스',      sector: '사이버보안', region: '미국',   assetClass: 'equity',    currency: 'USD', price: 392,   annualReturn: 28.4, volatility: 42.4, expenseRatio: 0 },
  { ticker: 'PANW', name: '팔로알토 네트웍스',              sector: '사이버보안', region: '미국',   assetClass: 'equity',    currency: 'USD', price: 412,   annualReturn: 22.6, volatility: 38.4, expenseRatio: 0 },
  { ticker: 'MRVL', name: '마벨 테크놀로지',               sector: '반도체',     region: '미국',   assetClass: 'equity',    currency: 'USD', price: 108,   annualReturn: 18.4, volatility: 38.6, expenseRatio: 0 },
  { ticker: 'AMAT', name: '어플라이드 머티리얼즈',          sector: '반도체장비', region: '미국',   assetClass: 'equity',    currency: 'USD', price: 198,   annualReturn: 16.4, volatility: 32.4, expenseRatio: 0 },
  { ticker: 'LRCX', name: '램 리서치',                      sector: '반도체장비', region: '미국',   assetClass: 'equity',    currency: 'USD', price: 682,   annualReturn: 16.4, volatility: 34.4, expenseRatio: 0 },
  { ticker: 'KLAC', name: 'KLA',                            sector: '반도체장비', region: '미국',   assetClass: 'equity',    currency: 'USD', price: 718,   annualReturn: 15.2, volatility: 30.4, expenseRatio: 0 },
  { ticker: 'ASML', name: 'ASML 홀딩(네덜란드)',            sector: '반도체장비', region: '유럽',   assetClass: 'equity',    currency: 'USD', price: 658,   annualReturn: 16.2, volatility: 30.8, expenseRatio: 0 },
  { ticker: 'SAP',  name: 'SAP SE(독일)',                   sector: 'IT·소프트웨어', region: '유럽', assetClass: 'equity',   currency: 'USD', price: 282,   annualReturn: 12.4, volatility: 22.4, expenseRatio: 0 },
  { ticker: 'TM',   name: '토요타 자동차',                  sector: '자동차',     region: '일본',   assetClass: 'equity',    currency: 'USD', price: 198,   annualReturn: 9.4,  volatility: 20.4, expenseRatio: 0 },
  { ticker: 'BABA', name: '알리바바 그룹',                  sector: 'IT·플랫폼', region: '중국',   assetClass: 'equity',    currency: 'USD', price: 92,    annualReturn: 2.4,  volatility: 38.4, expenseRatio: 0 },
  { ticker: 'PDD',  name: 'PDD 홀딩스',                     sector: 'IT·플랫폼', region: '중국',   assetClass: 'equity',    currency: 'USD', price: 128,   annualReturn: 16.4, volatility: 42.4, expenseRatio: 0 },
  { ticker: 'BIDU', name: '바이두',                          sector: 'IT·플랫폼', region: '중국',   assetClass: 'equity',    currency: 'USD', price: 86,    annualReturn: 2.8,  volatility: 36.4, expenseRatio: 0 },
  { ticker: 'NVO',  name: '노보 노디스크(덴마크)',           sector: '헬스케어',   region: '유럽',   assetClass: 'equity',    currency: 'USD', price: 92,    annualReturn: 22.4, volatility: 26.4, expenseRatio: 0 },
  { ticker: 'NOVO-B.CO', name: '노보 노디스크 B(코펜하겐)', sector: '헬스케어',   region: '유럽',   assetClass: 'equity',    currency: 'DKK', price: 638,   annualReturn: 22.4, volatility: 26.4, expenseRatio: 0 },
  { ticker: 'ABBV', name: '애브비',                          sector: '헬스케어',   region: '미국',   assetClass: 'equity',    currency: 'USD', price: 196,   annualReturn: 12.4, volatility: 18.4, expenseRatio: 0 },
  { ticker: 'MRK',  name: '머크',                            sector: '헬스케어',   region: '미국',   assetClass: 'equity',    currency: 'USD', price: 118,   annualReturn: 10.4, volatility: 16.4, expenseRatio: 0 },
  { ticker: 'PFE',  name: '화이자',                          sector: '헬스케어',   region: '미국',   assetClass: 'equity',    currency: 'USD', price: 26,    annualReturn: 4.2,  volatility: 18.4, expenseRatio: 0 },
  { ticker: 'ISRG', name: '인튜이티브 서지컬',               sector: '의료기기',   region: '미국',   assetClass: 'equity',    currency: 'USD', price: 548,   annualReturn: 16.4, volatility: 22.4, expenseRatio: 0 },
  { ticker: 'ABT',  name: '애봇 래버러토리스',               sector: '의료기기',   region: '미국',   assetClass: 'equity',    currency: 'USD', price: 122,   annualReturn: 10.2, volatility: 16.4, expenseRatio: 0 },
  { ticker: 'COST', name: '코스트코 홀세일',                sector: '유통',       region: '미국',   assetClass: 'equity',    currency: 'USD', price: 1038,  annualReturn: 14.2, volatility: 14.4, expenseRatio: 0 },
  { ticker: 'SBUX', name: '스타벅스',                       sector: '식음료',     region: '미국',   assetClass: 'equity',    currency: 'USD', price: 102,   annualReturn: 8.4,  volatility: 22.4, expenseRatio: 0 },
  { ticker: 'MCD',  name: '맥도날드',                       sector: '식음료',     region: '미국',   assetClass: 'equity',    currency: 'USD', price: 305,   annualReturn: 9.4,  volatility: 14.4, expenseRatio: 0 },
  { ticker: 'NKE',  name: '나이키',                          sector: '소비재',     region: '미국',   assetClass: 'equity',    currency: 'USD', price: 72,    annualReturn: 7.4,  volatility: 22.4, expenseRatio: 0 },
  { ticker: 'LVMH.PA', name: 'LVMH(파리)',                  sector: '명품·소비재',region: '유럽',   assetClass: 'equity',    currency: 'EUR', price: 658,   annualReturn: 12.4, volatility: 22.4, expenseRatio: 0 },
  { ticker: 'GS',   name: '골드만삭스',                     sector: '금융',       region: '미국',   assetClass: 'equity',    currency: 'USD', price: 632,   annualReturn: 13.4, volatility: 24.4, expenseRatio: 0 },
  { ticker: 'BAC',  name: '뱅크오브아메리카',               sector: '금융',       region: '미국',   assetClass: 'equity',    currency: 'USD', price: 46,    annualReturn: 9.4,  volatility: 24.4, expenseRatio: 0 },
  { ticker: 'WFC',  name: '웰스파고',                        sector: '금융',       region: '미국',   assetClass: 'equity',    currency: 'USD', price: 72,    annualReturn: 10.2, volatility: 22.4, expenseRatio: 0 },
  { ticker: 'MS',   name: '모건스탠리',                     sector: '금융',       region: '미국',   assetClass: 'equity',    currency: 'USD', price: 128,   annualReturn: 11.4, volatility: 24.4, expenseRatio: 0 },
  { ticker: 'CVX',  name: '셰브론',                          sector: '에너지',     region: '미국',   assetClass: 'equity',    currency: 'USD', price: 148,   annualReturn: 7.4,  volatility: 22.4, expenseRatio: 0 },
  { ticker: 'NEE',  name: '넥스트에라 에너지',               sector: '클린에너지', region: '미국',   assetClass: 'equity',    currency: 'USD', price: 72,    annualReturn: 8.4,  volatility: 16.4, expenseRatio: 0 },
  { ticker: 'ENPH', name: '엔페이즈 에너지',                 sector: '클린에너지', region: '미국',   assetClass: 'equity',    currency: 'USD', price: 72,    annualReturn: 12.4, volatility: 52.4, expenseRatio: 0 },
  { ticker: 'FSLR', name: '퍼스트 솔라',                    sector: '클린에너지', region: '미국',   assetClass: 'equity',    currency: 'USD', price: 158,   annualReturn: 14.4, volatility: 42.4, expenseRatio: 0 },

  // ── 현금·기타 ──────────────────────────────────────────────
  // ── 고배당주 개별 종목 (미국) ──────────────────────────────
  { ticker: 'O',    name: '리얼티 인컴(월배당)',          sector: '리츠',       region: '미국',   assetClass: 'equity',    currency: 'USD', price: 54,    annualReturn: 7.8,  volatility: 14.2, expenseRatio: 0 },
  { ticker: 'T',    name: 'AT&T',                        sector: '통신',       region: '미국',   assetClass: 'equity',    currency: 'USD', price: 22,    annualReturn: 6.4,  volatility: 16.4, expenseRatio: 0 },
  { ticker: 'MO',   name: '알트리아 그룹',               sector: '소비재',     region: '미국',   assetClass: 'equity',    currency: 'USD', price: 44,    annualReturn: 8.2,  volatility: 18.4, expenseRatio: 0 },
  { ticker: 'PM',   name: '필립 모리스 인터내셔널',      sector: '소비재',     region: '미국',   assetClass: 'equity',    currency: 'USD', price: 128,   annualReturn: 9.4,  volatility: 16.2, expenseRatio: 0 },
  { ticker: 'IBM',  name: 'IBM',                         sector: 'IT·테크',    region: '미국',   assetClass: 'equity',    currency: 'USD', price: 218,   annualReturn: 9.8,  volatility: 18.4, expenseRatio: 0 },
  { ticker: 'VZ',   name: '버라이즌 커뮤니케이션스',     sector: '통신',       region: '미국',   assetClass: 'equity',    currency: 'USD', price: 40,    annualReturn: 5.8,  volatility: 14.4, expenseRatio: 0 },
  { ticker: 'D',    name: '도미니언 에너지',             sector: '유틸리티',   region: '미국',   assetClass: 'equity',    currency: 'USD', price: 34,    annualReturn: 6.2,  volatility: 14.6, expenseRatio: 0 },
  { ticker: 'SO',   name: '서던 컴퍼니',                 sector: '유틸리티',   region: '미국',   assetClass: 'equity',    currency: 'USD', price: 88,    annualReturn: 7.4,  volatility: 12.8, expenseRatio: 0 },
  { ticker: 'WPC',  name: 'W.P. 케리(월배당 리츠)',     sector: '리츠',       region: '미국',   assetClass: 'equity',    currency: 'USD', price: 54,    annualReturn: 7.2,  volatility: 14.8, expenseRatio: 0 },
  { ticker: 'STAG', name: 'STAG 인더스트리얼(월배당)', sector: '리츠',       region: '미국',   assetClass: 'equity',    currency: 'USD', price: 36,    annualReturn: 8.2,  volatility: 16.4, expenseRatio: 0 },
  { ticker: 'AMT',  name: '아메리칸 타워(통신 리츠)',   sector: '리츠',       region: '미국',   assetClass: 'equity',    currency: 'USD', price: 188,   annualReturn: 9.4,  volatility: 18.4, expenseRatio: 0 },
  { ticker: 'PLD',  name: '프로로지스(물류 리츠)',       sector: '리츠',       region: '미국',   assetClass: 'equity',    currency: 'USD', price: 114,   annualReturn: 10.2, volatility: 18.6, expenseRatio: 0 },
  { ticker: 'SPG',  name: '사이먼 프라퍼티 그룹(리츠)', sector: '리츠',       region: '미국',   assetClass: 'equity',    currency: 'USD', price: 164,   annualReturn: 9.8,  volatility: 20.4, expenseRatio: 0 },
  { ticker: 'ADC',  name: '어그리 리얼티(월배당 리츠)', sector: '리츠',       region: '미국',   assetClass: 'equity',    currency: 'USD', price: 68,    annualReturn: 7.4,  volatility: 14.2, expenseRatio: 0 },

  // ── 고배당주 개별 종목 (국내) ──────────────────────────────
  { ticker: '088980', name: '맥쿼리인프라',              sector: '인프라·배당', region: '국내',  assetClass: 'equity',    currency: 'KRW', price: 14050,  annualReturn: 6.8,  volatility: 10.4, expenseRatio: 0 },
  { ticker: '010060', name: 'OCI홀딩스',                 sector: '화학',       region: '국내',  assetClass: 'equity',    currency: 'KRW', price: 72400,  annualReturn: 5.4,  volatility: 28.4, expenseRatio: 0 },
  { ticker: '402340', name: 'SK스퀘어',                  sector: '지주회사',   region: '국내',  assetClass: 'equity',    currency: 'KRW', price: 68400,  annualReturn: 7.2,  volatility: 22.4, expenseRatio: 0 },
  { ticker: '002790', name: '아모레G',                   sector: '소비재',     region: '국내',  assetClass: 'equity',    currency: 'KRW', price: 38200,  annualReturn: 5.8,  volatility: 26.4, expenseRatio: 0 },

  // ── 고배당 ETF (국내) ─────────────────────────────────────
  { ticker: '280930', name: 'KODEX 고배당',              sector: '국내배당',   region: '국내',  assetClass: 'equity',    currency: 'KRW', price: 14280,  annualReturn: 7.8,  volatility: 16.4, expenseRatio: 0.16 },
  { ticker: '182480', name: 'TIGER 고배당',              sector: '국내배당',   region: '국내',  assetClass: 'equity',    currency: 'KRW', price: 13840,  annualReturn: 7.6,  volatility: 16.2, expenseRatio: 0.29 },
  { ticker: '315960', name: 'KBSTAR 고배당',             sector: '국내배당',   region: '국내',  assetClass: 'equity',    currency: 'KRW', price: 13240,  annualReturn: 7.4,  volatility: 16.0, expenseRatio: 0.19 },
  { ticker: '396150', name: 'TIGER 리츠부동산인프라채권', sector: '리츠·채권', region: '국내',  assetClass: 'equity',    currency: 'KRW', price: 8640,   annualReturn: 6.4,  volatility: 8.4,  expenseRatio: 0.29 },
  { ticker: '440300', name: 'ACE 미국배당성장',          sector: '미국배당',   region: '미국',  assetClass: 'equity',    currency: 'KRW', price: 14280,  annualReturn: 10.4, volatility: 13.8, expenseRatio: 0.09 },
  { ticker: '494800', name: 'ACE 미국30년국채+15%프리미엄', sector: '채권',   region: '미국',  assetClass: 'bond',      currency: 'KRW', price: 8240,   annualReturn: 5.8,  volatility: 10.4, expenseRatio: 0.25 },
  { ticker: '490590', name: 'TIGER 미국S&P500+15%프리미엄', sector: '미국배당', region: '미국', assetClass: 'equity',   currency: 'KRW', price: 9840,   annualReturn: 9.8,  volatility: 12.4, expenseRatio: 0.25 },

  // ── 금·귀금속 현물 ─────────────────────────────────────────
  { ticker: 'GOLD-KRX-1KG', name: '금 현물 99.99% 1kg (KRX)',  sector: '귀금속',   region: '글로벌', assetClass: 'commodity', currency: 'KRW', price: 128000000, annualReturn: 7.1, volatility: 14.0, expenseRatio: 0 },
  { ticker: 'GOLD-KRX-100G', name: '금 현물 99.99% 100g (KRX)', sector: '귀금속',  region: '글로벌', assetClass: 'commodity', currency: 'KRW', price: 12800000,  annualReturn: 7.1, volatility: 14.0, expenseRatio: 0 },
  { ticker: 'GOLD-KRX-10G',  name: '금 현물 99.99% 10g (KRX)',  sector: '귀금속',  region: '글로벌', assetClass: 'commodity', currency: 'KRW', price: 1280000,   annualReturn: 7.1, volatility: 14.0, expenseRatio: 0 },
  { ticker: 'SILVER-KRX-1KG',name: '은 현물 99.99% 1kg (KRX)',  sector: '귀금속',  region: '글로벌', assetClass: 'commodity', currency: 'KRW', price: 1680000,   annualReturn: 5.4, volatility: 22.6, expenseRatio: 0 },
  { ticker: 'PLAT-100G',     name: '플래티넘 100g',             sector: '귀금속',  region: '글로벌', assetClass: 'commodity', currency: 'KRW', price: 5200000,   annualReturn: 4.8, volatility: 18.4, expenseRatio: 0 },

  // ── 국내 채권 (직접 투자) ──────────────────────────────────
  { ticker: 'KTB-3Y',  name: '국고채 3년',                sector: '채권',       region: '국내',   assetClass: 'bond',      currency: 'KRW', price: 10000,  annualReturn: 3.2,  volatility: 1.4,  expenseRatio: 0 },
  { ticker: 'KTB-10Y', name: '국고채 10년',               sector: '채권',       region: '국내',   assetClass: 'bond',      currency: 'KRW', price: 10000,  annualReturn: 3.6,  volatility: 3.8,  expenseRatio: 0 },
  { ticker: 'KTB-30Y', name: '국고채 30년',               sector: '채권',       region: '국내',   assetClass: 'bond',      currency: 'KRW', price: 10000,  annualReturn: 4.0,  volatility: 8.4,  expenseRatio: 0 },
  { ticker: 'KCD-1Y',  name: '정기예금 1년 (은행)',        sector: '현금성자산', region: '국내',   assetClass: 'bond',      currency: 'KRW', price: 10000,  annualReturn: 3.8,  volatility: 0.1,  expenseRatio: 0 },
  { ticker: 'MMF-KRW', name: 'MMF (원화)',                 sector: '현금성자산', region: '국내',   assetClass: 'cash',      currency: 'KRW', price: 1000,   annualReturn: 3.4,  volatility: 0.05, expenseRatio: 0.05 },
  { ticker: 'RP-1W',   name: '환매조건부채권 (RP) 1주',   sector: '현금성자산', region: '국내',   assetClass: 'cash',      currency: 'KRW', price: 1000,   annualReturn: 3.3,  volatility: 0.02, expenseRatio: 0 },

  // ── 국내 리츠 ─────────────────────────────────────────────
  { ticker: '395400', name: 'SK리츠',                     sector: '리츠',       region: '국내',   assetClass: 'equity',    currency: 'KRW', price: 4680,   annualReturn: 6.4,  volatility: 12.4, expenseRatio: 0 },
  { ticker: '404990', name: '신한알파리츠',               sector: '리츠',       region: '국내',   assetClass: 'equity',    currency: 'KRW', price: 5840,   annualReturn: 6.2,  volatility: 12.2, expenseRatio: 0 },
  { ticker: '348950', name: '제이알글로벌리츠',           sector: '리츠',       region: '국내',   assetClass: 'equity',    currency: 'KRW', price: 3240,   annualReturn: 5.8,  volatility: 14.4, expenseRatio: 0 },
  { ticker: '350520', name: '롯데리츠',                   sector: '리츠',       region: '국내',   assetClass: 'equity',    currency: 'KRW', price: 3680,   annualReturn: 6.0,  volatility: 13.4, expenseRatio: 0 },
  { ticker: '357250', name: '코람코더원리츠',             sector: '리츠',       region: '국내',   assetClass: 'equity',    currency: 'KRW', price: 4120,   annualReturn: 6.2,  volatility: 12.8, expenseRatio: 0 },

  // ── 현금성 자산 ───────────────────────────────────────────
  { ticker: 'CASH', name: '현금·MMF',                     sector: '현금',       region: '국내',   assetClass: 'cash',      currency: 'KRW', price: 1000,   annualReturn: 3.5,  volatility: 0.1,  expenseRatio: 0 },
  { ticker: 'GOLD', name: '금 현물 (KRX)',                 sector: '원자재',     region: '글로벌', assetClass: 'commodity', currency: 'KRW', price: 128000, annualReturn: 7.1,  volatility: 14.0, expenseRatio: 0 },
]

export const getAssetInfo = (ticker) =>
  ASSET_UNIVERSE.find((a) => a.ticker === ticker) || {
    ticker, name: ticker,
    sector: '기타', region: '기타', assetClass: 'equity',
    currency: 'KRW', price: 0, annualReturn: 0, volatility: 15, expenseRatio: 0,
  }

// ─── 계좌 유형 ────────────────────────────────────────────
export const ACCOUNT_TYPES = {
  ISA:       { label: 'ISA',    fullName: 'ISA (개인종합자산관리)',  color: '#5BA3CF', taxAdvantaged: true,  desc: '비과세 한도 200만원(일반형)/400만원(서민형). 초과분 9.9% 분리과세. 3년 이상 유지 필수. 해외 주식 직접 투자 불가 (국내 상장 ETF는 가능). 만기 후 연금계좌 이전 시 추가 세액공제.' },
  PENSION:   { label: '연금저축', fullName: '연금저축·IRP',         color: '#7C3AED', taxAdvantaged: true,  desc: '운용 중 배당·매매차익 완전 과세이연. 세액공제 한도: 연금저축 연 600만원, IRP 포함 900만원 (공제율 13.2~16.5%). 수령 시 연금소득세 3.3~5.5%. 55세 이상·5년+ 수령 조건. 중도인출 시 16.5% 기타소득세.' },
  BROKERAGE: { label: '종합계좌', fullName: '종합 주식 계좌',       color: '#10B981', taxAdvantaged: false, desc: '국내 주식 매매차익: 소액주주 비과세. 해외 주식: 250만원 공제 후 22% 양도소득세. 배당·이자: 15.4% 원천징수. 금융소득 연 2,000만원 초과 시 종합과세 합산.' },
  CMA:       { label: 'CMA',    fullName: 'CMA (종합자산관리)',     color: '#F59E0B', taxAdvantaged: false, desc: '단기 유동성 자금 운용 전용. MMF형·RP형·발행어음형 등. 이자소득 15.4% 원천징수. 주식·ETF 직접 투자는 종합위탁 계좌와 동일 과세.' },
  GOLD:      { label: '금현물',  fullName: '금 현물 계좌 (KRX)',    color: '#EAB308', taxAdvantaged: true,  desc: 'KRX 금현물 계좌: 매매차익 양도소득세 비과세, 부가세 면제. 실물 인출 시에만 부가세(10%) 부과. 순도 99.99% 금 현물 거래 전용.' },
}

// ─── 벤치마크 ─────────────────────────────────────────────
export const BENCHMARKS = {
  sp500: {
    id: 'sp500', name: 'S&P 500', desc: '미국 대형주 지수', color: '#5BA3CF',
    composition: [{ ticker: 'SPY', allocation: 100 }],
    stats: { annualReturn: 10.7, volatility: 15.2, sharpe: 0.71, maxDrawdown: 33.8 },
  },
  global: {
    id: 'global', name: '글로벌 시장', desc: '전세계 ETF 포트폴리오', color: '#10B981',
    composition: [{ ticker: 'VT', allocation: 100 }],
    stats: { annualReturn: 8.9, volatility: 15.6, sharpe: 0.57, maxDrawdown: 31.2 },
  },
  allWeather: {
    id: 'allWeather', name: '올웨더', desc: '레이 달리오 리스크 패리티', color: '#F59E0B',
    composition: [
      { ticker: 'SPY', allocation: 30 }, { ticker: 'TLT', allocation: 40 },
      { ticker: 'GLD', allocation: 7.5 }, { ticker: 'VEA', allocation: 22.5 },
    ],
    stats: { annualReturn: 7.2, volatility: 8.3, sharpe: 0.87, maxDrawdown: 13.1 },
  },
}

// ─── 주가 히스토리 생성 (시드 기반 결정론적) ─────────────
function seededRng(seed) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    return (s >>> 0) / 0xffffffff
  }
}

export function getHistoricalPrices(ticker, months = 60) {
  const asset = getAssetInfo(ticker)
  const rng = seededRng(ticker.split('').reduce((a, c) => a + c.charCodeAt(0), 0))
  const monthlyReturn = asset.annualReturn / 100 / 12
  const monthlyVol    = asset.volatility   / 100 / Math.sqrt(12)
  const now = new Date()
  const data = []
  let price = asset.price * 0.6

  for (let i = months; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const z = Math.sqrt(-2 * Math.log(Math.max(rng(), 1e-10))) * Math.cos(2 * Math.PI * rng())
    if (i < months) price *= (1 + monthlyReturn + z * monthlyVol)
    data.push({
      date:  d.toISOString().slice(0, 7),
      month: `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}`,
      price: Math.max(price, 1),
    })
  }
  return data
}
