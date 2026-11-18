// 계산 로직을 만들기 전, 화면 개발용 "예시 응답"
// 모든 응답에 meta.sample = true 를 붙여 실제 계산 결과와 구분한다.

export const SAMPLE_META = {
  sample: true,
  note: "계산 로직 구현 전 예시 응답입니다. 숫자는 실제 학사 판정이 아닙니다.",
};

export const graduationAnalysisSample = {
  entryYear: 2024,
  requirementSource: "2026학년도 2학기 학업이수가이드 (24학번 이후, 융합전공Ⅰ)",
  total: { earned: 98, required: 130, remaining: 32 },
  tracks: [
    {
      role: "PRIMARY",
      trackName: "샘플 트랙 A",
      earned: 33,
      required: 39,
      categories: [
        { category: "MAJOR_BASIC", earned: 3, required: 3, remaining: 0 },
        { category: "MAJOR_REQUIRED", earned: 12, required: 15, remaining: 3 },
        { category: "MAJOR_ELECTIVE", earned: 18, required: 21, remaining: 3 },
      ],
    },
    {
      role: "SECONDARY",
      trackName: "샘플 트랙 B",
      earned: 27,
      required: 39,
      categories: [
        { category: "MAJOR_BASIC", earned: 3, required: 3, remaining: 0 },
        { category: "MAJOR_REQUIRED", earned: 9, required: 15, remaining: 6 },
        { category: "MAJOR_ELECTIVE", earned: 15, required: 21, remaining: 6 },
      ],
    },
  ],
  liberal: {
    required: { earned: 13, required: 13, remaining: 0 },
    distribution: { earned: 12, required: 15, remaining: 3, areasCovered: 3, areasRequired: 4 },
    general: { earned: 0, required: 3, remaining: 3 },
  },
  free: { earned: 13, required: 21, remaining: 8 },
  missingRequiredCourses: [
    { code: "SAMPLE-004", name: "예시 전공필수 3", credits: 3, trackRole: "PRIMARY" },
  ],
  checksNeeded: ["대체 과목·재수강 처리 규정은 아직 반영하지 않았습니다."],
};

export const courseRecommendationsSample = [
  {
    course: { code: "SAMPLE-004", name: "예시 전공필수 3", credits: 3 },
    recognizedAs: [{ trackRole: "PRIMARY", category: "MAJOR_REQUIRED" }],
    reasons: [{ type: "MISSING_REQUIRED", text: "1트랙 전공필수 미이수 과목입니다." }],
  },
  {
    course: { code: "SAMPLE-007", name: "예시 전공선택 3", credits: 3 },
    recognizedAs: [
      { trackRole: "PRIMARY", category: "MAJOR_ELECTIVE" },
      { trackRole: "SECONDARY", category: "MAJOR_ELECTIVE" },
    ],
    reasons: [{ type: "COUNTS_FOR_EITHER", text: "1·2트랙 중 원하는 트랙의 전공선택으로 인정받을 수 있습니다." }],
  },
];

export const trackComparisonSample = {
  replaceRole: "SECONDARY",
  current: { trackName: "샘플 트랙 B", earned: 27, required: 39 },
  target: { trackName: "샘플 트랙 C", earnedIfChanged: 15, required: 39 },
  categories: [
    { category: "MAJOR_BASIC", currentEarned: 3, targetEarned: 3, required: 3 },
    { category: "MAJOR_REQUIRED", currentEarned: 9, targetEarned: 3, required: 15 },
    { category: "MAJOR_ELECTIVE", currentEarned: 15, targetEarned: 9, required: 21 },
  ],
  recognizedCourses: [{ code: "SAMPLE-001", name: "예시 전공기초", category: "MAJOR_BASIC" }],
  notRecognizedCourses: [{ code: "SAMPLE-009", name: "예시 트랙B 전용", credits: 3 }],
  additionalRequiredCourses: [{ code: "SAMPLE-011", name: "예시 트랙C 전공필수", credits: 3 }],
};

export const roadmapDraftSample = {
  title: "추천 로드맵 초안",
  items: [
    { kind: "COURSE", courseCode: "SAMPLE-004", plannedYear: 3, plannedSemester: 2 },
    { kind: "COURSE", courseCode: "SAMPLE-007", plannedYear: 4, plannedSemester: 1 },
    { kind: "EXTRACURRICULAR", programTitle: "예시 프로그램 A-1", plannedYear: 3, plannedSemester: 2 },
  ],
};