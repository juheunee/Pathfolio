# 학사 기준 데이터 입력 형식 (`academic-data.json`)

시드(`prisma/seed.js`)가 이 파일을 읽어 트랙, 과목, 트랙별 인정 규칙, 선수과목, 비교과를 DB 에 넣는다.
졸업 요건, 시연 계정, 이수 내역은 이 파일이 아니라 `seed.js` 에 있다.

## 고친 뒤 확인

```bash
pnpm --filter server data:check   # 형식과 코드 연결만 검사 (DB 를 건드리지 않음)
pnpm --filter server db:seed      # 검사 통과 후 DB 에 다시 넣기 (기존 데이터는 모두 지워짐)
```

`data:check` 는 틀린 곳의 위치(예: `rules[3]: 없는 트랙 코드 MOBLIE`)를 알려 준다. 통과하지 못하면 시드도 DB 를 건드리기 전에 멈춘다.

## 공통 규칙

- 확인되지 않은 값은 추정하지 않는다. 비워 둘 수 있는 칸은 `null` 로 두거나 생략하고, `note` 에 "확인 필요"를 적는다.
- 공식 자료가 아닌 시연용 값은 `"isSample": true` 로 표시한다. 없으면 `false`(공식)로 본다.
- 코드(트랙 `code`, 과목 `code`)는 다른 칸이 이름 대신 가리키는 값이다. 바꾸면 그 코드를 쓰는 곳을 모두 같이 바꾼다.
- `seed.js` 의 시연 계정 이수 내역(7번)도 과목, 트랙 코드를 쓴다. 코드를 지우거나 바꾸면 그 부분도 고친다.
- JSON 은 마지막 항목 뒤에 쉼표를 두면 오류가 나고, 숫자(`credits` 등)에 따옴표를 붙이면 검사에서 걸린다.
- `_안내` 칸은 설명용이며 시드가 읽지 않는다.

## 칸 설명

### `source` (자료 정보)

| 칸 | 필수 | 설명 |
| --- | --- | --- |
| `name` | ✅ | 근거 자료 이름 |
| `checkedAt` | ✅ | 자료를 확인한 날짜 `YYYY-MM-DD` |
| `catalogYear` | ✅ | 규칙에 연도를 따로 적지 않았을 때 쓰는 교육과정 연도 |

### `tracks` (트랙)

| 칸 | 필수 | 설명 |
| --- | --- | --- |
| `code` | ✅ | 영문 대문자, 숫자, 하이픈. 예: `MOBILE` |
| `name` | ✅ | 예: `모바일소프트웨어트랙` |
| `department` | ✅ | 소속 학부. 예: `컴퓨터공학부` |
| `sourceUrl` | | 공식 페이지 주소 |
| `isSample` | | 시연용이면 `true` |

### `courses` (교과목)

| 칸 | 필수 | 설명 |
| --- | --- | --- |
| `code` | ✅ | 학교 과목 코드. 예: `CTE0001` |
| `name` | ✅ | 과목 이름 |
| `credits` | ✅ | 학점 (숫자, 따옴표 없이) |
| `liberalArea` | | 선택필수교양이면 배분이수 영역 |
| `summary`, `profileUrl`, `syllabusUrl`, `sourceUrl` | | 교과목 프로파일 요약, 프로파일, 수업계획서, 출처 주소 |
| `isSample` | | 시연용이면 `true` |

### `rules` (트랙별 인정 규칙)

한 줄 = "이 트랙에서 이 과목은 무엇으로 인정된다". 같은 트랙, 과목, 연도는 한 줄만 둔다.

| 칸 | 필수 | 설명 |
| --- | --- | --- |
| `track` | ✅ | `tracks` 의 `code` |
| `course` | ✅ | `courses` 의 `code` |
| `category` | ✅ | `MAJOR_BASIC`(전기), `MAJOR_REQUIRED`(전필), `MAJOR_ELECTIVE`(전선) |
| `catalogYear` | | 비우면 `source.catalogYear` |
| `recommendedYear`, `recommendedSemester` | | 이수체계도의 권장 학년(1~4), 학기(1~2) |
| `sourceUrl`, `note` | | 근거 주소, 책자 쪽수와 확인 필요 사항 |

### `prerequisites` (선수과목)

`{ "course": "나중에 들을 과목 코드", "prerequisite": "먼저 들을 과목 코드" }`

### `extracurricular` (비교과)

`{ "category": "카테고리 이름", "sourceUrl": null, "isSample": true, "programs": [ { "title": "프로그램 이름", "points": null, "sourceUrl": null, "isSample": true } ] }`
