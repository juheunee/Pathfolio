# 개발 환경 실행 안내

## 1. 처음 한 번: 프로그램 설치

| 프로그램 | 버전 | 설치 확인 명령 |
| --- | --- | --- |
| Git | 아무 최신 버전 | `git --version` |
| Node.js | **24 LTS** (22.18 이상이면 동작) | `node -v` |
| pnpm | **12** | `pnpm -v` |
| Docker Desktop | 최신 | `docker --version` |

- Node.js: https://nodejs.org → LTS 버전 설치
- pnpm: Node 설치 후 터미널에서 `npm install -g pnpm@12`
- Docker Desktop: https://www.docker.com/products/docker-desktop → 설치 후 **실행해 둔다** (창 닫지 않고 내려두기)

## 2. 처음 한 번: 저장소 받기와 설정

```bash
git clone https://github.com/juheunee/Pathfolio.git
cd Pathfolio
pnpm install
```

`server/.env.example` 파일을 복사해 `server/.env` 를 만들고 값을 채운다.

| 키 | 넣을 값 |
| --- | --- |
| `DATABASE_URL` | 그대로 둔다 |
| `PORT` | 그대로 (4000) |
| `JWT_SECRET` | 아무 긴 영문·숫자 (각자 달라도 됨) |
| `DEMO_PASSWORD` | 팀에서 따로 공유한 시연용 비밀번호 |
| `CLIENT_ORIGIN` | 그대로 (화면 개발 서버 주소) |

```bash
pnpm db:up      # DB 켜기
pnpm db:setup   # 표 만들기 + 코드 생성 + 시연 데이터 넣기
```

## 3. 매번: 서버 실행

```bash
pnpm db:up        # Docker Desktop 이 켜져 있어야 함
pnpm dev:server   # 서버 실행
```

브라우저에서 http://localhost:4000/api/health → `"status":"ok"` 가 보이면 성공.

## 4. 시연 계정

| loginId | 설명 |
| --- | --- |
| `demo-y1` | 가상 1학년 |
| `demo-y2` | 가상 2학년 |
| `demo-m1` ~ `demo-m3` | 팀원 3명 자리 (실제 이수 내역 정리 후 교체) |

비밀번호는 모두 `server/.env` 의 `DEMO_PASSWORD`. (실제 비밀번호가 커밋되지 않도록 주의)

## 5. 자주 쓰는 명령

| 명령 | 하는 일 |
| --- | --- |
| `pnpm db:reset` | DB 를 비우고 처음 상태로 (시연 데이터 다시 넣기) |
| `pnpm --filter server db:studio` | 브라우저에서 DB 표를 엑셀처럼 보기 |
| `pnpm db:down` | DB 끄기 (데이터는 남음) |
| `git pull` 후 표 구조가 바뀌었으면 | `pnpm install` → `pnpm db:setup` |

## 6. 문제 해결

| 증상 | 해결 |
| --- | --- |
| `pnpm db:up` 에서 `Cannot connect to the Docker daemon` / `docker: command not found` | Docker Desktop 을 실행하고 1분 뒤 다시 |
| `port is already allocated` (5432) | 내 컴퓨터에 다른 PostgreSQL 이 켜져 있음 → 끄거나 팀에 공유 |
| `Cannot resolve environment variable: DATABASE_URL` | `server/.env` 파일이 없음 → 2단계 |
| `EADDRINUSE: address already in use :::4000` | 서버가 이미 켜져 있음 → 다른 터미널의 서버를 Ctrl + C |
| `Cannot find module './generated/prisma/client.ts'` | `pnpm --filter server db:generate` |
| 로그인하면 401 | 비밀번호가 `.env` 의 `DEMO_PASSWORD` 와 다름. 바꿨다면 `pnpm db:reset` |