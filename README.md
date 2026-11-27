# Pathfolio

**Pathfolio**는 한성대학교 학생을 위한 HSU 진로로드맵 e-Advisor 웹앱 프로토타입이다. 학생이 전공트랙을 탐색하고 학년·학기별 교과·비교과 계획, 졸업 후 5년 계획을 작성·관리하도록 돕는다. 팀 Veylo(이주흔·문차민·장수안)가 공모전용으로 개발 중이다.

학업 이력, 트랙 요건, 비교과 활동을 여러 곳에서 찾아 계획해야 하는 부담을 줄이는 것이 목표다. 주요 사용자는 신입생·재학생·취업 준비 졸업생이다. 결과는 진로 설계 참고 자료이며 학교의 공식 이수·졸업 판정이 아니다. 시연용 가상 데이터는 sample로 표시한다.

## 핵심 흐름과 MVP

- 신입생: 로그인 → 트랙 둘러보기·조합 비교 → 학기별 계획 작성 또는 공개 계획 가져오기 → 대표 로드맵 설정.
- 재학생: 확정된 학업 결과 확인 → 로드맵별 계획·진행·졸업 가능성 확인 → 카드 수정·저장 → 재로그인 후 조회.
- 취준생: 졸업 후 5년 마일스톤 작성 → 공개 범위 설정 → 후배에게 허용된 계획 공유.

직접 만든 로드맵은 친구 공개가 기본이고 가져온 복사본은 비공개로 시작한다. 학생은 공식 교과 성적·비교과 포인트를 수정하지 않는다. 홀랜드 RIASEC 기반 트랙 추천과 트랙 변경·재수강 시뮬레이션은 P1 목표다. [MVP 범위와 인수 기준](docs/MVP.md) 및 [제품 동작 명세](docs/SPEC.md)에 전체 범위를 적었다.

## 기술과 현재 구현

| 영역 | 목표·결정 | 현재 main (2026-11-28 확인) |
| --- | --- | --- |
| 프런트엔드 | React PC 웹 | React 19, Vite 6, React Router와 4개 sample 화면 |
| 백엔드 | Node.js·Express JSON API | Express 5, JWT·bcryptjs, 일부 조회·저장 API |
| DB | **Oracle 확정** | PostgreSQL·Prisma 코드가 남아 있음. Oracle 전환 미구현 |
| 패키지 | JavaScript·pnpm workspace | 루트 package.json, client·server 패키지 |
| 배포 | 미확정. Vercel·OCI는 검토안 | 공개 시연 URL 확인되지 않음 |

현재 화면 경로는 /, /academic, /courses, /roadmap이다. 화면의 로드맵 초안은 React 메모리에 있어 새로고침하면 초기화된다. 서버에 일부 로드맵 API가 있지만 화면과 연결되지 않았다. 졸업·추천 예시 응답은 실제 계산이 아니다. Notion의 최신 정책은 Oracle을 기준으로 하며 현행 PostgreSQL/Prisma 스크립트는 전환 전 코드로만 남아 있다.

## 저장소 구조

| 경로 | 내용 |
| --- | --- |
| client/src/ | 화면, 컴포넌트, sample 데이터 |
| server/src/ | Express 라우트, 인증, DB 접근 |
| server/prisma/ | 현행 PostgreSQL/Prisma 스키마·시드·마이그레이션(전환 대상) |
| docs/ | 제품 명세, MVP, 현행 API·ERD·실행 안내 |

## 로컬에서 확인하기

현재 화면을 보려면 Node.js 22.18 이상과 pnpm이 필요하다. 저장소 루트에서 아래 **실제 스크립트**를 사용한다.

~~~sh
pnpm install
pnpm dev:client
~~~

Vite 기본 주소는 http://localhost:5173이다. pnpm build:client는 화면 빌드, pnpm --filter server data:check는 학사 JSON 데이터 검사를 실행한다. 서버 실행 스크립트 pnpm dev:server도 존재하지만 **현재 PostgreSQL/Prisma 환경용**이다. Oracle 연결·DDL·시드·서버 실행 절차는 아직 구현·검증되지 않았으므로 이 README에 Oracle 실행 명령을 제시하지 않는다. [docs/SETUP.md](docs/SETUP.md)는 전환 전 환경의 상세 기록이다.

현재 server/.env.example에는 DATABASE_URL, PORT, JWT_SECRET, DEMO_PASSWORD, CLIENT_ORIGIN이 정의돼 있다. 값은 실제 파일을 확인해 각자 설정하고 비밀 값이나 .env 파일을 커밋하지 않는다. Oracle 전환 시 변수 이름과 설정 방법을 코드·예제 파일·이 문서에 함께 반영한다.

## 문서와 출처

- [AGENTS.md](AGENTS.md): 개발·협업·검증 규칙
- [docs/SPEC.md](docs/SPEC.md): 제품 정책과 요구사항 ID
- [docs/MVP.md](docs/MVP.md): P0/P1 범위와 인수 시나리오
- [docs/API.md](docs/API.md), [docs/ERD.md](docs/ERD.md), [docs/SETUP.md](docs/SETUP.md): 현행 구현 계약과 전환 전 실행 기록
- [Notion HSU 진로로드맵 개발 공모전](https://app.notion.com/p/411776f72047803db6b1d8821851f90b): 프로젝트와 최신 통합 기획 문서의 상위 페이지

요구사항은 최신 Notion 통합본을 기준으로, 구현 상태는 원격 main의 실제 코드로 확인했다. 둘의 차이는 [MVP.md](docs/MVP.md)에 남겼다.
