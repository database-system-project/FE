# API 연동 가이드

백엔드 API를 화면에 붙일 때의 공통 규칙입니다. 로그인·회원가입이 이 방식으로 먼저 연결되어 있으니 참고해서 같은 모양으로 추가하면 됩니다.

## 실행

1. 백엔드를 로컬에서 켭니다 (BE 레포 `docs/LOCAL_SETUP.md`). 처음 한 번은 `./gradlew initLocalEnv`로 `.env`를 만듭니다.
   ```bash
   docker compose up -d --wait
   ./gradlew clean bootRun      # http://127.0.0.1:8080
   ```
2. DB가 비어 있으면 로그인할 계정이 없습니다. 테스트 계정·진료과·의사 일정·진찰료를 넣는 시드를 실행합니다 (BE 폴더에서).
   ```bash
   docker compose exec -T postgres psql -U hospital -d hospital < (FE 레포 경로)/system-prototype/dev/local-test-seed.sql
   ```
   계정: `admin01`, `desk01`, `cashier01`, `doctor01`, `doctor02`, `patient01` / 비밀번호 `Test1234!`
3. 프론트를 켭니다.
   ```bash
   cd system-prototype
   pnpm install
   pnpm dev        # http://localhost:8443
   ```
4. 프론트에서 `/api/v1/...`로 부르면 Vite가 백엔드로 넘겨줍니다 (`vite.config.ts`의 `proxy`). 그래서 로컬에서는 CORS 설정이 필요 없습니다.
5. 백엔드 주소가 다르면 `.env.example`을 복사해 `.env.local`을 만들고 `VITE_API_PROXY_TARGET`을 바꿉니다.

## 폴더

```
src/
├─ api/
│  ├─ client.ts     모든 요청이 거치는 곳. 토큰을 붙이고, 오류를 ApiError로 바꾼다
│  ├─ types.ts      요청·응답 모양 (Notion API 명세서 기준)
│  └─ auth.ts       인증 API 모음 (login, signup, me)
└─ auth/
   ├─ session.ts    토큰을 localStorage에 저장·삭제
   └─ AuthContext.tsx  로그인 상태. 어느 화면에서든 useAuth()로 꺼낸다
```

## 새 API 붙이는 순서 (예: 원무 대기열)

1. `api/types.ts`에 응답 모양을 적습니다.
   ```ts
   export type QueueItem = { visitId: number; receptionCode: string; patientName: string; status: VisitStatus; checkedInAt: string };
   ```
2. 도메인별 파일을 만들고 함수를 추가합니다. 경로는 `/api/v1` 뒤부터 적습니다.
   ```ts
   // api/reception.ts
   export const receptionApi = {
     queue: (status?: VisitStatus) => api.get<{ items: QueueItem[] }>("/visits/queue", { status }),
     checkIn: (appointmentId: number) => api.post<CheckInResponse>(`/reception/appointments/${appointmentId}/check-in`),
   };
   ```
3. 화면에서는 `fetch`를 직접 쓰지 않고 이 함수를 부릅니다. 목데이터(`mocks/data.ts`)는 연동이 끝난 화면부터 지웁니다.

## 규칙

- **상태값은 대문자 코드 그대로** 받고(`RESERVED`, `WAITING` …) 화면에 보여줄 때만 한글로 바꿉니다.
- **오류는 `message`가 아니라 `code`로 분기**합니다.
  ```ts
  try { ... } catch (e) {
    if (e instanceof ApiError && e.code === "CHECK_IN_UNAVAILABLE") { ... }
  }
  ```
- 토큰은 `client.ts`가 알아서 붙입니다. 401이 오면 자동으로 로그아웃되고 로그인 화면으로 돌아갑니다.
- 로그인한 사람 정보: `const { user, role, logout } = useAuth();`
  - `user.role`은 백엔드 코드(`RECEPTION` 등), `role`은 화면용 이름(`desk` 등)입니다.
  - `user.patientId` / `user.doctorId` / `user.staffId` 중 역할에 맞는 하나만 들어 있습니다.
- 날짜는 `YYYY-MM-DD`, 일시는 `2026-11-10T09:00:00+09:00` 형태로 주고받습니다.

## 시연 계정

`pages/auth/Login.tsx`의 `demoAccounts`는 로컬 테스트 시드의 아이디와 같습니다. 백엔드의 최종 시드 계정이 정해지면 맞춰서 바꿉니다.
