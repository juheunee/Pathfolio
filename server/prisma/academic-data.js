// 학사 기준 데이터(prisma/data/academic-data.json) 읽기와 형식 검사
// 시드에서 불러 쓰고, `pnpm --filter server data:check` 로 단독 실행 가능
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { z } from "zod";

const DATA_FILE = fileURLToPath(new URL("./data/academic-data.json", import.meta.url));

const text = z.string().trim().min(1);
const url = z.string().trim().url().nullish();
const year = z.number().int().min(2000).max(2100);

const schema = z.object({
  source: z.object({
    name: text,
    checkedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD 형식 필요"),
    catalogYear: year,
  }),
  tracks: z
    .array(
      z.object({
        code: z.string().regex(/^[A-Z0-9-]+$/, "영문 대문자, 숫자, 하이픈만 허용"),
        name: text,
        department: text,
        sourceUrl: url,
        isSample: z.boolean().default(false),
      }),
    )
    .min(1),
  courses: z.array(
    z.object({
      code: text,
      name: text,
      credits: z.number().int().min(0).max(10),
      liberalArea: text.nullish(),
      summary: text.nullish(),
      profileUrl: url,
      syllabusUrl: url,
      sourceUrl: url,
      isSample: z.boolean().default(false),
    }),
  ),
  rules: z.array(
    z.object({
      track: text,
      course: text,
      category: z.enum(["MAJOR_BASIC", "MAJOR_REQUIRED", "MAJOR_ELECTIVE"]),
      catalogYear: year.optional(),
      recommendedYear: z.number().int().min(1).max(4).nullish(),
      recommendedSemester: z.number().int().min(1).max(2).nullish(),
      sourceUrl: url,
      note: text.nullish(),
    }),
  ),
  prerequisites: z.array(z.object({ course: text, prerequisite: text })).default([]),
  extracurricular: z
    .array(
      z.object({
        category: text,
        sourceUrl: url,
        isSample: z.boolean().default(false),
        programs: z.array(
          z.object({
            title: text,
            points: z.number().int().min(0).nullish(),
            sourceUrl: url,
            isSample: z.boolean().default(false),
          }),
        ),
      }),
    )
    .default([]),
});

// 파일 읽기, 형식 검사, 코드 연결(없는 코드, 중복) 검사 후 데이터 반환
export function loadAcademicData() {
  const raw = JSON.parse(readFileSync(DATA_FILE, "utf8"));
  const result = schema.safeParse(raw);
  if (!result.success) {
    const lines = result.error.issues.map((i) => `- ${i.path.join(".")}: ${i.message}`);
    throw new Error(`academic-data.json 형식 오류\n${lines.join("\n")}`);
  }
  const data = result.data;

  const problems = [];
  const collect = (codes, label) => {
    const seen = new Set();
    for (const code of codes) {
      if (seen.has(code)) problems.push(`${label} 코드 중복: ${code}`);
      seen.add(code);
    }
    return seen;
  };
  const trackCodes = collect(data.tracks.map((t) => t.code), "트랙");
  const courseCodes = collect(data.courses.map((c) => c.code), "과목");
  collect(data.extracurricular.map((c) => c.category), "비교과 카테고리");

  // DB 의 (트랙, 과목, 교육과정 연도) 중복 금지 제약과 같은 기준
  const ruleKeys = new Set();
  data.rules.forEach((r, i) => {
    if (!trackCodes.has(r.track)) problems.push(`rules[${i}]: 없는 트랙 코드 ${r.track}`);
    if (!courseCodes.has(r.course)) problems.push(`rules[${i}]: 없는 과목 코드 ${r.course}`);
    const key = `${r.track}/${r.course}/${r.catalogYear ?? data.source.catalogYear}`;
    if (ruleKeys.has(key)) problems.push(`rules[${i}]: 같은 트랙, 과목, 연도 규칙 중복 ${key}`);
    ruleKeys.add(key);
  });
  data.prerequisites.forEach((p, i) => {
    for (const code of [p.course, p.prerequisite]) {
      if (!courseCodes.has(code)) problems.push(`prerequisites[${i}]: 없는 과목 코드 ${code}`);
    }
  });
  if (problems.length > 0) {
    throw new Error(`academic-data.json 내용 오류\n${problems.map((p) => `- ${p}`).join("\n")}`);
  }
  return data;
}

// 단독 실행 시에만 검사 결과 출력 (시드에서 불러 쓸 때는 출력 없음)
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const d = loadAcademicData();
    console.log(
      `academic-data.json 확인 완료: 트랙 ${d.tracks.length}개, 과목 ${d.courses.length}개, ` +
        `인정 규칙 ${d.rules.length}개, 선수과목 ${d.prerequisites.length}개, 비교과 카테고리 ${d.extracurricular.length}개`,
    );
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
}
