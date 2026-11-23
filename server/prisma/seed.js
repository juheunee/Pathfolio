// 시연용 데이터 적재
// - 트랙, 과목, 트랙별 인정 규칙, 선수과목, 비교과: prisma/data/academic-data.json (공식 자료 기준, 시연용 값은 isSample = true)
// - 졸업 요건, 시연 계정, 이수 내역: 이 파일 (계정과 이수 내역은 가상 데이터)
import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../src/db.js";
import { loadAcademicData } from "./academic-data.js";

async function main() {
  if (!process.env.DEMO_PASSWORD) {
    throw new Error("server/.env 에 DEMO_PASSWORD 가 없습니다.");
  }
  const data = loadAcademicData(); // 형식 오류면 DB 변경 전에 중단

  // 0) 기존 데이터 비우기 + 번호(id)를 1부터 다시 시작 (목적: 여러 번 실행해도 같은 결과)
  await prisma.$executeRawUnsafe(`
    TRUNCATE "CategorySubscription", "RoadmapItem", "Roadmap", "AcademicRecord", "Account",
      "ExtracurricularProgram", "ExtracurricularCategory", "TrackCourseRule", "CoursePrerequisite",
      "Course", "Track", "GraduationRequirement"
    RESTART IDENTITY CASCADE
  `);

  // 1) 트랙 (JSON 순서대로 id 1, 2, 3 부여)
  const track = {};
  for (const t of data.tracks) {
    track[t.code] = await prisma.track.create({ data: t });
  }

  // 2) 교과목
  const course = {};
  for (const c of data.courses) {
    course[c.code] = await prisma.course.create({ data: c });
  }

  // 3) 선수과목
  for (const p of data.prerequisites) {
    await prisma.coursePrerequisite.create({
      data: { courseId: course[p.course].id, prerequisiteId: course[p.prerequisite].id },
    });
  }

  // 4) 트랙별 인정 규칙 (연도 생략 시 source.catalogYear 적용)
  for (const r of data.rules) {
    await prisma.trackCourseRule.create({
      data: {
        trackId: track[r.track].id,
        courseId: course[r.course].id,
        category: r.category,
        catalogYear: r.catalogYear ?? data.source.catalogYear,
        recommendedYear: r.recommendedYear ?? null,
        recommendedSemester: r.recommendedSemester ?? null,
        sourceUrl: r.sourceUrl ?? null,
        note: r.note ?? null,
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
  const withTracks = { primaryTrackId: track.MOBILE.id, secondaryTrackId: track.WEB.id };
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

  // 7) 이수 내역 (가상, 과목은 academic-data.json 의 공식 과목)
  //    [계정, 과목, 연도, 학기, 성적표 이수구분, 인정 트랙(전공만)]
  //    한 과목은 두 트랙 중 한 곳에만 인정. V020004 는 두 트랙 모두 전공선택이지만 웹공학으로 인정받은 예
  const records = [
    ["demo-y1", "CTE0001", 2026, "FIRST", "MAJOR_BASIC", null], // 트랙 선택 전 이수 [확인 필요]
    ["demo-y1", "SAMPLE-L01", 2026, "FIRST", "LIBERAL_REQUIRED", null],
    ["demo-y2", "CTE0001", 2025, "FIRST", "MAJOR_BASIC", "MOBILE"],
    ["demo-y2", "CTE0002", 2025, "SECOND", "MAJOR_BASIC", "WEB"],
    ["demo-y2", "V021006", 2026, "FIRST", "MAJOR_REQUIRED", "MOBILE"],
    ["demo-y2", "SAMPLE-L01", 2025, "FIRST", "LIBERAL_REQUIRED", null],
    ...["demo-m1", "demo-m2", "demo-m3"].flatMap((id) => [
      [id, "CTE0001", 2024, "FIRST", "MAJOR_BASIC", "MOBILE"],
      [id, "CTE0002", 2024, "SECOND", "MAJOR_BASIC", "WEB"],
      [id, "V020004", 2025, "FIRST", "MAJOR_ELECTIVE", "WEB"],
      [id, "V020010", 2025, "SECOND", "MAJOR_ELECTIVE", "MOBILE"],
      [id, "V024003", 2025, "SECOND", "MAJOR_REQUIRED", "WEB"],
      [id, "V021006", 2026, "FIRST", "MAJOR_REQUIRED", "MOBILE"],
      [id, "SAMPLE-L01", 2024, "FIRST", "LIBERAL_REQUIRED", null],
      [id, "SAMPLE-L02", 2024, "SECOND", "LIBERAL_DISTRIBUTION", null],
    ]),
  ];
  for (const [loginId, code, takenYear, term, category, trackCode] of records) {
    await prisma.academicRecord.create({
      data: {
        accountId: account[loginId].id,
        courseId: course[code].id,
        takenYear,
        term,
        earnedCredits: course[code].credits,
        category,
        trackId: trackCode ? track[trackCode].id : null,
      },
    });
  }

  // 8) 비교과 카테고리, 프로그램
  for (const c of data.extracurricular) {
    const category = await prisma.extracurricularCategory.create({
      data: { name: c.category, sourceUrl: c.sourceUrl ?? null, isSample: c.isSample },
    });
    for (const p of c.programs) {
      await prisma.extracurricularProgram.create({ data: { ...p, categoryId: category.id } });
    }
  }

  console.log(
    `시드 완료: 계정 ${accounts.length}개, 트랙 ${data.tracks.length}개, 과목 ${data.courses.length}개, ` +
      `인정 규칙 ${data.rules.length}개, 이수 내역 ${records.length}개, 비교과 카테고리 ${data.extracurricular.length}개`,
  );
}

main()
  .catch((e) => {
    console.error(e.message ?? e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
