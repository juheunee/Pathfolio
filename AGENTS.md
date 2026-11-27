# Pathfolio 개발·협업 지침

> 이 저장소에서 작업하는 사람과 코딩 에이전트에게 적용한다. 제품 정책은 [docs/SPEC.md](docs/SPEC.md), 이번 범위와 완료 기준은 [docs/MVP.md](docs/MVP.md)가 기준이다. 2026-11-27 [Notion 통합본](https://app.notion.com/p/411776f72047803db6b1d8821851f90b)의 결정과 현재 코드를 구분한다.

## 작업 시작

1. [README.md](README.md)에서 목적·실행 상태, [docs/SPEC.md](docs/SPEC.md)에서 동작·권한·학사 정책, [docs/MVP.md](docs/MVP.md)에서 우선순위·인수 기준을 읽는다.
2. 변경할 계약은 [Notion 기능명세서](https://app.notion.com/p/425776f7204780ceacaaf925a4d4fef4), [데이터 설계](https://app.notion.com/p/425776f72047800bb1c4edbd1e3edea3), [API 계약](https://app.notion.com/p/425776f7204780f7b0d1c81d631ca7cb)과 대조한다. 기존 [docs/API.md](docs/API.md)·[docs/ERD.md](docs/ERD.md)는 현행 PostgreSQL/Prisma 구현 기록이다.
3. git status로 미커밋 변경을 확인한다. 다른 사람의 파일을 stash·삭제·재작성하지 않는다. 문서·코드·Notion이 다르면 채택된 최신 결정과 실제 구현을 분리해 적고, 정책을 임의로 확정하지 않는다.

## 작업 위치와 현재 전환점

| 위치 | 담당 내용 |
| --- | --- |
| client/src/App.jsx, client/src/pages/, client/src/components/, client/src/data/ | React·Vite·React Router 화면. 현재 4개 경로와 sample 메모리 초안이 있다 |
| server/src/routes/, server/src/auth.js, server/src/db.js | Express API·인증·DB 접근. 현재 일부 API는 PostgreSQL/Prisma 기반 |
| server/prisma/, server/.env.example, docker-compose.yml | 기존 DB 스키마·시드·환경. **Oracle 전환 전 구현**이며 새 기능의 기준으로 확장하지 않는다 |
| docs/SPEC.md, docs/MVP.md | 제품 동작과 시연 범위 |
| docs/API.md, docs/ERD.md, docs/SETUP.md | 현행 구현 기록·실행 안내. Oracle 코드가 바뀔 때 함께 갱신한다 |

**목표 DB는 Oracle로 확정**됐다. PostgreSQL/Prisma 코드를 유지하는 새 설계를 진행하지 않는다. Oracle 인스턴스·드라이버 연결, DDL·마이그레이션, 시드, 로그인·저장·재조회 순으로 작게 검증한다. node-oracledb·Knex는 후보이며 연결 검증 전 확정 구현으로 쓰지 않는다. 변경 시 현행 PostgreSQL 안내와 환경 변수 이름을 실제 Oracle 설정에 맞게 정리한다. 파괴적 데이터 마이그레이션은 별도 합의가 필요하다.

## 기능 변경 규칙

- Issue에 담당자, 관련 SPEC ID, 범위·제외, 완료 조건·검증, 의존성을 적는다. FE/BE/추천·DB 담당은 Issue에서 정하며 개인 역할을 미리 단정하지 않는다.
- 화면을 연결하기 전에 JSON 필드·ID·날짜/학기·오류 코드·인증 조건을 API 계약과 맞춘다. 계약 변경은 화면·서버·샘플·검증·SPEC을 함께 갱신하고 관련 담당자에게 알린다.
- 학생의 교과 성적·비교과 포인트는 **조회 전용 원장**이다. 계획 완료·교외활동 결과와 분리한다. 계절·상상더학기 계획은 공식 결과가 확정되기 전 취득으로 세지 않는다. C+ 이하 재수강은 이력을 보존하고 같은 과목 학점은 한 번만 센다. 모호한 상한·귀속·평점 규칙은 자료 확인 전 차단/허용 정책을 새로 만들지 않는다.
- 직접 만든 로드맵 기본 공개는 FRIENDS, 가져온 복사본은 PRIVATE다. 수락된 친구·익명·이메일 공개 범위를 목록·상세·복사 API에서 **서버가** 확인한다. 전체·카드 가져오기 성공은 각 1회로 집계하고 같은 요청 재전송은 중복 집계하지 않는다.
- 권한은 토큰의 계정으로 판단한다. 클라이언트가 보낸 ownerId/accountId나 숨긴 버튼을 신뢰하지 않는다. 학생과 관리자 권한을 서버에서 분리한다.
- 학사 규칙·전공 요건·교과 개설 정보는 출처, 적용 학번·학년도, 변경일을 기록한다. 공식 확인 전 데이터에는 sample을 표시한다. AI 더미나 생성 설명을 공식 판정처럼 노출하지 않는다.
- 기존 코드의 스타일을 따라 변경 범위를 좁힌다. 무관한 포맷 변경이나 임의 리팩터링을 섞지 않는다. 비밀번호·토큰·실제 학번/성적·환경 파일을 커밋하지 않는다.

## 검증과 보고

현재 저장소에서 확인한 명령은 루트의 pnpm build:client, server 패키지의 pnpm --filter server data:check다. pnpm dev:client와 pnpm dev:server는 개발 서버 실행 명령이다. 테스트 스크립트는 아직 없다. pnpm db:setup·db:reset은 **PostgreSQL/Prisma 전용**이므로 Oracle 검증 명령으로 사용하지 않는다. Oracle 전환 뒤 실제 스크립트와 환경을 확인하고 README·docs/SETUP.md를 갱신한다.

변경에 따라 빌드·데이터 검사와 수동 시연을 실행한다. 최소 확인 대상은 인증·계정 격리, 학기 학점·재수강, 로드맵 저장·재조회, 공개 권한, 전체/카드 가져오기 집계, 빈 상태·오류다. 실행하지 않은 검증은 통과로 적지 않는다. 작업 종료 시 **변경 파일과 이유 → 실행한 명령·결과 → 미검증 사항·남은 결정** 순서로 보고한다.

## 브랜치·PR

- 기본 브랜치는 main이다. 최신 main에서 목적별 짧은 브랜치를 만들고 main에 직접 커밋·푸시하지 않는다. 브랜치 형식은 type/member/short-description, type은 feat·fix·docs·refactor·test·chore·hotfix, member는 팀이 확정하기 전 제안 식별자 jh·cm·sa를 쓴다.
- 브랜치 생성 전 git status를 확인하고 git fetch origin으로 origin/main의 최신 상태를 확인한다. 타인 브랜치에 무단 커밋·푸시하지 않는다. force, reset --hard, 파괴적 clean, 임의 rebase·히스토리 수정, 일괄 ours/theirs 충돌 선택은 사전 합의 없이 금지한다.
- 커밋·PR 제목은 Conventional Commits 형식(type(scope): 한국어 요약)을 따른다. PR에는 목적, Issue, 변경, 화면 캡처, API/DB 영향, 검증 결과, 위험·후속 작업, 문서 수정 여부를 적는다. 작성자 외 1명 이상 승인·적용된 CI·관련 수동 확인 후 병합한다. 승인 뒤 실질 변경 시 재검토를 요청한다. Squash merge를 권장한다.
- 코딩 에이전트는 사용자 명시 허가 없이 커밋·푸시·PR 생성·병합을 하지 않는다. 기술 스택·인증·개인정보 범위·이수 정책·호환성 깨는 API·외부 유료 서비스·파괴적 DB 변경·마감 변경은 팀 합의 후 문서화한다.
