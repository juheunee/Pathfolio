# Pathfolio API 명세

- 상태: 1주차 초안 (2026-11-18 회의용)
- 기능 요구사항은 [`SPEC.md`](SPEC.md), 이 문서는 **요청·응답의 세부 규격**을 다룬다.
- 서버 주소(개발): `http://localhost:4000`
- 응답 방식: DB 응답 / 예시 응답(계산 로직 구현 전, `meta.sample = true`)

## 1. 공통 규칙

### 로그인과 토큰

1. `POST /api/auth/login` 으로 로그인하면 `token` 을 받는다.
2. 그 뒤 2장 목록에서 "로그인" 칸이 "필요"인 요청의 헤더에 `Authorization: Bearer <token>` 을 붙인다. 트랙·교과목·비교과는 로그인 없이 볼 수 있다.
3. 토큰 유효 시간: 8시간. 만료되면 401 → 화면은 로그인 화면으로 보낸다.
4. 서버는 토큰 속 계정 번호로만 "내 데이터"를 찾는다. 주소나 본문에 다른 계정 번호를 넣는 API 는 없다.

### 응답 모양

성공:

```json
{ "data": { }, "meta": { } }
```

- `data`: 실제 내용 (객체 또는 배열)
- `meta`: 있을 때만. 예시 응답이면 `{ "sample": true, "note": "..." }`

실패:

```json
{ "error": { "code": "BAD_REQUEST", "message": "입력값을 확인해 주세요.", "details": [{ "field": "loginId", "message": "아이디를 입력해 주세요." }] } }
```

- 화면은 `error.message` 를 그대로 보여 줘도 된다. `details` 는 400 일 때만.

| HTTP | code | 언제 |
| --- | --- | --- |
| 200 | — | 성공 |
| 201 | — | 새로 만듦 (로드맵 생성) |
| 204 | — | 성공, 돌려줄 내용 없음 (로그아웃, 삭제, 구독 해제) |
| 400 | `BAD_REQUEST` | 입력값 오류, JSON 형식 오류, 없는 과목·프로그램 번호 |
| 401 | `UNAUTHORIZED` | 토큰 없음·틀림·만료, 아이디·비밀번호 불일치 |
| 404 | `NOT_FOUND` | 없는 주소, 없거나 **남의** 로드맵, 없는 과목·카테고리 |
| 500 | `INTERNAL_ERROR` | 서버 내부 오류 |

> 남의 로드맵은 403 이 아닌 404 로 답한다(있는지조차 알려 주지 않기 위함).

### 날짜·학기 표현

- 날짜·시각: ISO 8601 문자열 (`2026-11-18T07:30:00.000Z`, UTC)
- 이수 학기: `takenYear`(연도) + `term`(`FIRST`/`SUMMER`/`SECOND`/`WINTER`)
- 로드맵 배치: `plannedYear`(학년 1~4) + `plannedSemester`(1~2)
- 전공 영역: `MAJOR_BASIC` 전기 / `MAJOR_REQUIRED` 전필 / `MAJOR_ELECTIVE` 전선
- 트랙 역할: `PRIMARY` 1트랙 / `SECONDARY` 2트랙

## 2. 목록

| 방식 | 메서드 | 주소 | 하는 일 | 로그인 |
| --- | --- | --- | --- | --- |
| DB | GET | `/api/health` | 서버 살아 있는지 | 불필요 |
| DB | POST | `/api/auth/login` | 로그인 | 불필요 |
| DB | POST | `/api/auth/logout` | 로그아웃 | 필요 |
| DB | GET | `/api/me` | 내 계정·트랙 정보 | 필요 |
| DB | GET | `/api/me/academic-records` | 내 공식 이수 내역 (조회 전용) | 필요 |
| 예시 | GET | `/api/me/graduation-analysis` | 졸업 요건 대비 영역별 부족 학점 | 필요 |
| 예시 | GET | `/api/me/course-recommendations` | 수강 교과목 추천 + 근거 | 필요 |
| 예시 | POST | `/api/me/track-comparisons` | 트랙 변경 비교 | 필요 |
| 예시 | POST | `/api/me/roadmaps/draft` | 로드맵 초안 (저장 안 함) | 필요 |
| DB | GET | `/api/me/roadmaps` | 내 로드맵 목록 | 필요 |
| DB | POST | `/api/me/roadmaps` | 로드맵 저장(새로) | 필요 |
| DB | GET | `/api/me/roadmaps/{id}` | 로드맵 하나 | 필요 |
| DB | PUT | `/api/me/roadmaps/{id}` | 로드맵 수정(통째 교체) | 필요 |
| DB | DELETE | `/api/me/roadmaps/{id}` | 로드맵 삭제 | 필요 |
| DB | GET | `/api/tracks` | 트랙 목록 | 불필요 |
| DB | GET | `/api/courses?q=&trackId=` | 교과목 검색 | 불필요 |
| DB | GET | `/api/courses/{code}` | 교과목 상세 (트랙별 인정 영역·선수과목) | 불필요 |
| DB | GET | `/api/extracurricular/categories` | 비교과 카테고리 목록 | 불필요 |
| DB | GET | `/api/extracurricular/programs?categoryId=` | 카테고리별 프로그램 | 불필요 |
| DB | GET | `/api/me/subscriptions` | 내 구독 목록 | 필요 |
| DB | PUT | `/api/me/subscriptions/{categoryId}` | 구독 | 필요 |
| DB | DELETE | `/api/me/subscriptions/{categoryId}` | 구독 해제 | 필요 |

없는 것(의도적): 회원가입, 학업 정보·이수 내역 수정, 전공트랙 추천.

## 3. 인증

### POST `/api/auth/login`

요청

```json
{ "loginId": "demo-m1", "password": "(팀 공유 비밀번호)" }
```

응답 200

```json
{
  "data": {
    "token": "eyJhbGciOi...",
    "account": { "id": 3, "loginId": "demo-m1", "displayName": "팀원 1" }
  }
}
```

오류: 400(빈 값), 401(`아이디 또는 비밀번호가 올바르지 않습니다.`)

### POST `/api/auth/logout`

응답 204. 서버는 기록을 지우지 않으므로 **화면에서 토큰을 지우는 것**이 실제 로그아웃이다.

## 4. 내 학업 정보 (조회 전용)

### GET `/api/me`

```json
{
  "data": {
    "id": 3, "loginId": "demo-m1", "displayName": "팀원 1", "email": null,
    "entryYear": 2024, "currentYear": 3, "currentSemester": 2,
    "primaryTrackId": 1, "secondaryTrackId": 2,
    "primaryTrack": { "id": 1, "code": "SAMPLE-A", "name": "샘플 트랙 A", "department": "샘플 학부", "sourceUrl": null, "isSample": true },
    "secondaryTrack": { "id": 2, "code": "SAMPLE-B", "name": "샘플 트랙 B", "department": "샘플 학부", "sourceUrl": null, "isSample": true },
    "createdAt": "2026-11-17T01:00:00.000Z"
  }
}
```

### GET `/api/me/academic-records`

```json
{
  "data": [
    {
      "id": 6, "accountId": 3, "courseId": 1, "takenYear": 2024, "term": "FIRST", "earnedCredits": 3,
      "category": "MAJOR_BASIC", "trackId": 1, "grade": null,
      "course": { "code": "SAMPLE-001", "name": "예시 전공기초", "credits": 3, "liberalArea": null },
      "track": { "id": 1, "name": "샘플 트랙 A" }
    }
  ],
  "meta": { "totalCredits": 20, "count": 7 }
}
```

## 5. 계산 기능 (예시 응답)

모두 `meta`: `{ "sample": true, "note": "계산 로직 구현 전 예시 응답입니다. 숫자는 실제 학사 판정이 아닙니다." }`

### GET `/api/me/graduation-analysis`

```json
{
  "data": {
    "entryYear": 2024,
    "requirementSource": "2026학년도 2학기 학업이수가이드 (24학번 이후, 융합전공Ⅰ)",
    "total": { "earned": 98, "required": 130, "remaining": 32 },
    "tracks": [
      {
        "role": "PRIMARY", "trackName": "샘플 트랙 A", "earned": 33, "required": 39,
        "categories": [
          { "category": "MAJOR_BASIC", "earned": 3, "required": 3, "remaining": 0 },
          { "category": "MAJOR_REQUIRED", "earned": 12, "required": 15, "remaining": 3 },
          { "category": "MAJOR_ELECTIVE", "earned": 18, "required": 21, "remaining": 3 }
        ]
      }
    ],
    "liberal": {
      "required": { "earned": 13, "required": 13, "remaining": 0 },
      "distribution": { "earned": 12, "required": 15, "remaining": 3, "areasCovered": 3, "areasRequired": 4 },
      "general": { "earned": 0, "required": 3, "remaining": 3 }
    },
    "free": { "earned": 13, "required": 21, "remaining": 8 },
    "missingRequiredCourses": [{ "code": "SAMPLE-004", "name": "예시 전공필수 3", "credits": 3, "trackRole": "PRIMARY" }],
    "checksNeeded": ["대체 과목·재수강 처리 규정은 아직 반영하지 않았습니다."]
  }
}
```

(`tracks` 에는 실제로 1·2트랙 두 개가 온다. 위는 하나만 표시)

### GET `/api/me/course-recommendations`

```json
{
  "data": [
    {
      "course": { "code": "SAMPLE-004", "name": "예시 전공필수 3", "credits": 3 },
      "recognizedAs": [{ "trackRole": "PRIMARY", "category": "MAJOR_REQUIRED" }],
      "reasons": [{ "type": "MISSING_REQUIRED", "text": "1트랙 전공필수 미이수 과목입니다." }]
    }
  ]
}
```

- `reasons[].type`(초안): `MISSING_REQUIRED` 미이수 필수, `COUNTS_FOR_EITHER` 1·2트랙 중 원하는 트랙에 인정 가능(한 과목은 한 트랙에만 인정), (추가 예정)
- `reasons[].text` 는 규칙 코드가 만든 문장. AI 설명은 별도 칸으로 추가 예정 (규칙 결과와 AI 문장을 섞지 않는다)

### POST `/api/me/track-comparisons`

요청

```json
{ "replaceRole": "SECONDARY", "targetTrackId": 3 }
```

응답 200

```json
{
  "data": {
    "replaceRole": "SECONDARY",
    "current": { "trackName": "샘플 트랙 B", "earned": 27, "required": 39 },
    "target": { "trackName": "샘플 트랙 C", "earnedIfChanged": 15, "required": 39 },
    "categories": [
      { "category": "MAJOR_BASIC", "currentEarned": 3, "targetEarned": 3, "required": 3 },
      { "category": "MAJOR_REQUIRED", "currentEarned": 9, "targetEarned": 3, "required": 15 },
      { "category": "MAJOR_ELECTIVE", "currentEarned": 15, "targetEarned": 9, "required": 21 }
    ],
    "recognizedCourses": [{ "code": "SAMPLE-001", "name": "예시 전공기초", "category": "MAJOR_BASIC" }],
    "notRecognizedCourses": [{ "code": "SAMPLE-009", "name": "예시 트랙B 전용", "credits": 3 }],
    "additionalRequiredCourses": [{ "code": "SAMPLE-011", "name": "예시 트랙C 전공필수", "credits": 3 }]
  }
}
```

오류: 400 (`replaceRole` 이 PRIMARY/SECONDARY 가 아님, `targetTrackId` 없음)

### POST `/api/me/roadmaps/draft`

저장하지 않고 초안만 돌려준다. 화면은 이 초안을 보여 주고, 사용자가 "저장"을 누르면 `POST /api/me/roadmaps` 로 보낸다.

```json
{
  "data": {
    "title": "추천 로드맵 초안",
    "items": [
      { "kind": "COURSE", "courseCode": "SAMPLE-004", "plannedYear": 3, "plannedSemester": 2 },
      { "kind": "EXTRACURRICULAR", "programTitle": "예시 프로그램 A-1", "plannedYear": 3, "plannedSemester": 2 }
    ]
  }
}
```

> 실제 구현 때는 초안 항목에도 `courseId` / `programId` 를 같이 담아 바로 저장할 수 있게 한다.

## 6. 로드맵 (DB 저장)

### 로드맵 항목(RoadmapItem) 입력 규칙

| 칸 | 필수 | 설명 |
| --- | --- | --- |
| `kind` | ✅ | `COURSE` 또는 `EXTRACURRICULAR` |
| `courseId` | 교과면 ✅ | 과목 번호 (`/api/courses` 의 `id`) |
| `programId` | 비교과면 둘 중 하나 | 프로그램 번호 |
| `customTitle` | 비교과면 둘 중 하나 | 목록에 없는 활동을 직접 적을 때 (100자 이내) |
| `plannedYear` | ✅ | 1~4 |
| `plannedSemester` | ✅ | 1~2 |
| `status` | | `PLANNED`(기본) / `DONE` |
| `sortOrder` | | 같은 학기 안 순서, 기본 0 |

### POST `/api/me/roadmaps`

요청

```json
{
  "title": "내 로드맵",
  "items": [
    { "kind": "COURSE", "courseId": 4, "plannedYear": 3, "plannedSemester": 2 },
    { "kind": "EXTRACURRICULAR", "programId": 1, "plannedYear": 3, "plannedSemester": 2 },
    { "kind": "EXTRACURRICULAR", "customTitle": "직접 적은 활동", "plannedYear": 4, "plannedSemester": 1, "status": "DONE" }
  ]
}
```

응답 201 (GET 하나 조회와 같은 모양)

```json
{
  "data": {
    "id": 1, "accountId": 3, "title": "내 로드맵", "aiExplanation": null,
    "createdAt": "2026-11-17T05:45:47.191Z", "updatedAt": "2026-11-17T05:45:47.191Z",
    "items": [
      {
        "id": 1, "roadmapId": 1, "kind": "COURSE", "courseId": 4, "programId": null, "customTitle": null,
        "plannedYear": 3, "plannedSemester": 2, "status": "PLANNED", "sortOrder": 0,
        "course": { "code": "SAMPLE-004", "name": "예시 전공필수 3", "credits": 3 }, "program": null
      }
    ]
  }
}
```

오류: 400 (항목 규칙 위반 → `details[].field` 가 `items.0` 처럼 몇 번째 항목인지 알려 줌, 없는 과목·프로그램 번호)

### GET `/api/me/roadmaps`

```json
{ "data": [{ "id": 1, "title": "내 로드맵", "updatedAt": "2026-11-17T05:45:47.191Z", "_count": { "items": 3 } }] }
```

### GET `/api/me/roadmaps/{id}` · PUT `/api/me/roadmaps/{id}` · DELETE `/api/me/roadmaps/{id}`

- GET: 위 POST 응답과 같은 모양
- PUT: 요청 본문은 POST 와 같다. **항목 전체를 보낸 내용으로 교체**한다(일부만 보내면 나머지는 지워짐). 응답 200
- DELETE: 응답 204
- 남의 로드맵·없는 번호: 404

## 7. 공통 정보 (트랙·교과목·비교과, 로그인 불필요)

### GET `/api/tracks`

```json
{ "data": [{ "id": 1, "code": "SAMPLE-A", "name": "샘플 트랙 A", "department": "샘플 학부", "sourceUrl": null, "isSample": true }] }
```

### GET `/api/courses?q=필수&trackId=1`

- `q`: 과목명 일부 (선택), `trackId`: 그 트랙에서 인정되는 과목만 (선택)

```json
{
  "data": [
    {
      "id": 2, "code": "SAMPLE-002", "name": "예시 전공필수 1", "credits": 3, "liberalArea": null,
      "summary": null, "profileUrl": null, "syllabusUrl": null, "sourceUrl": null, "isSample": true,
      "rules": [
        { "id": 2, "trackId": 1, "courseId": 2, "category": "MAJOR_REQUIRED", "catalogYear": 2024,
          "recommendedYear": 2, "recommendedSemester": 1, "sourceUrl": null, "note": "샘플 규칙",
          "track": { "id": 1, "name": "샘플 트랙 A" } }
      ]
    }
  ]
}
```

### GET `/api/courses/{code}`

위 한 개와 같은 모양 + `prerequisites`:

```json
"prerequisites": [{ "courseId": 3, "prerequisiteId": 2, "prerequisite": { "code": "SAMPLE-002", "name": "예시 전공필수 1" } }]
```

오류: 404 (`과목을 찾을 수 없습니다.`)

### GET `/api/extracurricular/categories`

```json
{ "data": [{ "id": 1, "name": "샘플 카테고리 A", "sourceUrl": null, "isSample": true }] }
```

### GET `/api/extracurricular/programs?categoryId=1`

- `categoryId` 필수 (없으면 400). 최근 등록순.

```json
{
  "data": [
    { "id": 2, "categoryId": 1, "title": "예시 프로그램 A-2", "applyStart": null, "applyEnd": null,
      "runStart": null, "runEnd": null, "points": null, "sourceUrl": null, "isSample": true,
      "createdAt": "2026-11-17T05:45:01.700Z" }
  ]
}
```

## 8. 비교과 이메일 구독 (DB 저장)

| 요청 | 응답 |
| --- | --- |
| GET `/api/me/subscriptions` | `{ "data": [{ "accountId": 3, "categoryId": 1, "createdAt": "...", "category": { "id": 1, "name": "샘플 카테고리 A", ... } }] }` |
| PUT `/api/me/subscriptions/1` | 200, 구독 하나 (`data` 는 위 배열의 한 칸). 이미 구독 중이어도 200 |
| DELETE `/api/me/subscriptions/1` | 204. 이미 해제돼 있어도 204 |
| 없는 카테고리 PUT | 404 |

> 실제 메일 발송은 아직 없다. 신규 프로그램 감지(`ExtracurricularProgram.createdAt`)와 발송 방식은 기술 검토 후 추가.

## 9. 변경 규칙

- 이 문서 수정 → PR → 화면(이주흔)·데이터(장수안) 확인 → 서버 코드 변경
- 응답 칸 이름을 바꾸거나 지우는 변경은 화면을 깨뜨리므로 반드시 공유한다. 칸을 **추가**하는 것은 괜찮다.