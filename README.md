# 🏥 병원 진료·예약 관리 시스템

한성대학교 데이터베이스 설계 2팀 프로젝트입니다.
환자 예약부터 접수, 진료, 처방, 수납까지 병원 업무 흐름을 하나로 관리하는 시스템을 설계하고 구현합니다.

## 👥 사용자 역할

| 역할 | 주요 기능 |
| --- | --- |
| 환자 | 진료 예약·조회, 진료 내역, 처방·복약 안내, 전자영수증, 내 정보 |
| 원무 직원 | 원무 대시보드, 오늘 예약, 접수·대기 관리 |
| 의사 | 진료 대시보드, 대기 환자, 진료 기록·처방, 진료 일정 조회 |
| 수납 담당자 | 결제 대기, 결제 내역, 처방전 발행 |
| 관리자 | 진료과, 의사·일정, 사용자 계정, 약품, 병용·연령금기, 진찰료 관리 |

## 🛠 기술 스택

- **Frontend**: React 19, TypeScript, Vite 8, Tailwind CSS 4
- **Package Manager**: pnpm 10 (Node 22)
- **Deploy**: Vercel

## 📁 프로젝트 구조

```
.
├── system-prototype/      # 프론트엔드 (Vite + React)
│   └── src/
│       ├── components/    # 공통 컴포넌트
│       ├── constants/     # 역할·메뉴 상수
│       ├── mocks/         # 목업 데이터
│       └── pages/         # 역할별 화면 (patient, desk, doctor, cashier, admin, auth, shared)
└── work_report/           # DB 설계 산출물 (ERD, 테이블 정의서, 시스템 구성도, SQL)
```

## 🚀 시작하기

```bash
cd system-prototype
pnpm install
pnpm dev      # 개발 서버 (기본 포트 8443)
pnpm build    # 프로덕션 빌드
```

## 🌿 브랜치 전략

- `dev`: 기본 브랜치이자 **배포 브랜치**입니다. 병합되면 Vercel에 바로 배포됩니다.
- `feat/*`, `fix/*`, `chore/*`, `docs/*`: 작업 브랜치입니다. `dev`에서 따서 작업하고 `dev`로 PR을 보냅니다.

작업 순서는 다음과 같습니다.

1. 이슈를 만듭니다 (Feature / Bug / Chore 템플릿).
2. `dev`에서 작업 브랜치를 만듭니다. 예: `feat/12-booking-page`
3. PR을 열고 Vercel Preview URL로 화면을 확인합니다.
4. 리뷰 후 `dev`에 병합합니다.

## ✍️ 커밋 컨벤션

| 타입 | 설명 |
| --- | --- |
| `feat` | 새로운 기능 |
| `fix` | 버그 수정 |
| `refactor` | 리팩토링 |
| `style` | 코드 포맷, 스타일 변경 |
| `docs` | 문서 수정 |
| `chore` | 빌드, 설정 등 기타 작업 |

예: `feat: 진료 예약 페이지 추가 (#12)`
