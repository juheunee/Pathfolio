// 시연용 Mock 데이터. 모든 과목·트랙·비교과는 가짜이며 isSample = true.
// 공식 자료가 정리되면 이 파일의 샘플 부분을 실제 데이터로 바꾼다.
import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../src/db.js";

const CATALOG_YEAR = 2024;

async function main() {
  if (!process.env.DEMO_PASSWORD) {
    throw new Error("server/.env 에 DEMO_PASSWORD 가 없습니다.");
  }

  // 0) 기존 데이터 비우기 + 번호(id)를 1부터 다시 시작 (목적: 여러 번 실행해도 같은 결과)
  await prisma.$executeRawUnsafe(`
    TRUNCATE "CategorySubscription", "RoadmapItem", "Roadmap", "AcademicRecord", "Account",
      "ExtracurricularProgram", "ExtracurricularCategory", "TrackCourseRule", "CoursePrerequisite",
      "Course", "Track", "GraduationRequirement"
    RESTART IDENTITY CASCADE
  `);

  // 1) 트랙 (샘플)
  const track = {};
  for (const x of ["A", "B", "C"]) {
    track[x] = await prisma.track.create({
      data: { code: `SAMPLE-${x}`, name: `샘플 트랙 ${x}`, department: "샘플 학부", isSample: true },
    });
  }
  const { A: trackA, B: trackB, C: trackC } = track;

  // 2) 교과목 (샘플)
  const courseRows = [
    ["SAMPLE-001", "예시 전공기초", 3, null],
    ["SAMPLE-002", "예시 전공필수 1", 3, null],
    ["SAMPLE-003", "예시 전공필수 2", 3, null],
    ["SAMPLE-004", "예시 전공필수 3", 3, null],
    ["SAMPLE-005", "예시 전공선택 1", 3, null],
    ["SAMPLE-006", "예시 전공선택 2", 3, null],
    ["SAMPLE-007", "예시 전공선택 3", 3, null],
    ["SAMPLE-008", "예시 트랙B 전공필수", 3, null],
    ["SAMPLE-009", "예시 트랙B 전용", 3, null],
    ["SAMPLE-010", "예시 트랙C 전공선택", 3, null],
    ["SAMPLE-011", "예시 트랙C 전공필수", 3, null],
    ["SAMPLE-L01", "예시 교양필수 1", 2, null],
    ["SAMPLE-L02", "예시 선택필수교양 1", 3, "인문학적 상상력"],
  ];
  const course = {};
  for (const [code, name, credits, liberalArea] of courseRows) {
    course[code] = await prisma.course.create({ data: { code, name, credits, liberalArea, isSample: true } });
  }

  // 3) 선수과목 (샘플): 전공필수 2 를 듣기 전에 전공필수 1 수강 필수
  await prisma.coursePrerequisite.create({
    data: { courseId: course["SAMPLE-003"].id, prerequisiteId: course["SAMPLE-002"].id },
  });

  // 4) 트랙별 인정 영역 (샘플): SAMPLE-003 은 A 에서 전필, B 에서 전선 → 배분 검증용
  const rules = [
    [trackA, "SAMPLE-001", "MAJOR_BASIC", 1, 1],
    [trackA, "SAMPLE-002", "MAJOR_REQUIRED", 2, 1],
    [trackA, "SAMPLE-003", "MAJOR_REQUIRED", 2, 2],
    [trackA, "SAMPLE-004", "MAJOR_REQUIRED", 3, 1],
    [trackA, "SAMPLE-005", "MAJOR_ELECTIVE", 3, 1],
    [trackA, "SAMPLE-006", "MAJOR_ELECTIVE", 3, 2],
    [trackA, "SAMPLE-007", "MAJOR_ELECTIVE", 4, 1],
    [trackB, "SAMPLE-001", "MAJOR_BASIC", 1, 1],
    [trackB, "SAMPLE-003", "MAJOR_ELECTIVE", 2, 2],
    [trackB, "SAMPLE-007", "MAJOR_ELECTIVE", 4, 1],
    [trackB, "SAMPLE-008", "MAJOR_REQUIRED", 2, 1],
    [trackB, "SAMPLE-009", "MAJOR_ELECTIVE", 3, 1],
    [trackC, "SAMPLE-001", "MAJOR_BASIC", 1, 1],
    [trackC, "SAMPLE-010", "MAJOR_ELECTIVE", 3, 1],
    [trackC, "SAMPLE-011", "MAJOR_REQUIRED", 2, 2],
  ];
  for (const [track, code, category, year, semester] of rules) {
    await prisma.trackCourseRule.create({
      data: {
        trackId: track.id,
        courseId: course[code].id,
        category,
        catalogYear: CATALOG_YEAR,
        recommendedYear: year,
        recommendedSemester: semester,
        note: "샘플 규칙",
      },
    });
  }

  // 5) 졸업 요건 (24학번 이후, 융합전공Ⅰ). 출처: 2026학년도 2학기 수강신청 안내 및 학업이수가이드
  //    130 = 전공 78(트랙 39 × 2) + 교양 31 + 자유선택 21, 비교과 800포인트
  await prisma.graduationRequirement.create({
    data: {
      entryYearFrom: 2024,
      isSample: false,
      rules: {
        totalCredits: 130,
        perTrack: { total: 39, MAJOR_BASIC: 3, MAJOR_REQUIRED: 15, MAJOR_ELECTIVE: 21 },
        trackCount: 2,
        liberal: {
          total: 31,
          required: 13, // 교양필수
          distribution: { credits: 15, minAreas: 4, totalAreas: 5 }, // 선택필수교양 배분이수
          general: 3, // 일반교양 (자율선택)
        },
        freeCredits: 21,
        extracurricularPoints: 800,
      },
    },
  });

  // 6) 시연 계정 5개. 비밀번호는 .env 의 DEMO_PASSWORD 를 암호화해 저장
  const passwordHash = await bcrypt.hash(process.env.DEMO_PASSWORD, 10);
  //    트랙은 2학년 진학 때 고르므로 1학년 계정은 트랙이 없다
  const withTracks = { primaryTrackId: trackA.id, secondaryTrackId: trackB.id };
  const accounts = [
    { loginId: "demo-y1", displayName: "가상 1학년", entryYear: 2026, currentYear: 1, currentSemester: 2 },
    { loginId: "demo-y2", displayName: "가상 2학년", entryYear: 2025, currentYear: 2, currentSemester: 2, ...withTracks },
    { loginId: "demo-m1", displayName: "팀원 1", entryYear: 2024, currentYear: 3, currentSemester: 2, ...withTracks },
    { loginId: "demo-m2", displayName: "팀원 2", entryYear: 2024, currentYear: 3, currentSemester: 2, ...withTracks },
    { loginId: "demo-m3", displayName: "팀원 3", entryYear: 2024, currentYear: 3, currentSemester: 2, ...withTracks },
  ];
  const account = {};
  for (const a of accounts) {
    account[a.loginId] = await prisma.account.create({ data: { ...a, passwordHash } });
  }

  // 7) 이수 내역 (샘플). 실제 내역이 모이면 demo-m1~3 부분을 바꾼다
  //    [계정, 과목, 연도, 학기, 성적표 이수구분, 인정 트랙(전공만)]
  //    한 과목은 선택한 두 트랙 중 한 곳에만 인정된다. SAMPLE-003 은 B 트랙 전선으로 인정받은 예
  const records = [
    ["demo-y1", "SAMPLE-001", 2026, "FIRST", "MAJOR_BASIC", null], // 트랙 선택 전 이수 [확인 필요]
    ["demo-y1", "SAMPLE-L01", 2026, "FIRST", "LIBERAL_REQUIRED", null],
    ["demo-y2", "SAMPLE-001", 2025, "FIRST", "MAJOR_BASIC", "A"],
    ["demo-y2", "SAMPLE-002", 2026, "FIRST", "MAJOR_REQUIRED", "A"],
    ["demo-y2", "SAMPLE-L01", 2025, "FIRST", "LIBERAL_REQUIRED", null],
    ...["demo-m1", "demo-m2", "demo-m3"].flatMap((id) => [
      [id, "SAMPLE-001", 2024, "FIRST", "MAJOR_BASIC", "A"],
      [id, "SAMPLE-002", 2025, "FIRST", "MAJOR_REQUIRED", "A"],
      [id, "SAMPLE-003", 2025, "SECOND", "MAJOR_ELECTIVE", "B"],
      [id, "SAMPLE-005", 2026, "FIRST", "MAJOR_ELECTIVE", "A"],
      [id, "SAMPLE-008", 2025, "FIRST", "MAJOR_REQUIRED", "B"],
      [id, "SAMPLE-L01", 2024, "FIRST", "LIBERAL_REQUIRED", null],
      [id, "SAMPLE-L02", 2024, "SECOND", "LIBERAL_DISTRIBUTION", null],
    ]),
  ];
  for (const [loginId, code, takenYear, term, category, trackKey] of records) {
    await prisma.academicRecord.create({
      data: {
        accountId: account[loginId].id,
        courseId: course[code].id,
        takenYear,
        term,
        earnedCredits: course[code].credits,
        category,
        trackId: trackKey ? track[trackKey].id : null,
      },
    });
  }

  // 8) 비교과 카테고리·프로그램 (샘플)
  for (const x of ["A", "B", "C"]) {
    const category = await prisma.extracurricularCategory.create({
      data: { name: `샘플 카테고리 ${x}`, isSample: true },
    });
    for (const n of [1, 2]) {
      await prisma.extracurricularProgram.create({
        data: { categoryId: category.id, title: `예시 프로그램 ${x}-${n}`, isSample: true },
      });
    }
  }

  console.log("시드 완료: 계정 5개, 트랙 3개, 과목 13개, 비교과 카테고리 3개");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());