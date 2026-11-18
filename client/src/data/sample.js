export const profile = {
  year: 3,
  semester: 2,
  entryYear: 2024,
  tracks: ['샘플 트랙 A', '샘플 트랙 B'],
};

export const academic = {
  credits: { earned: 98, required: 130, remaining: 32 },
  areas: [
    { name: '1트랙', earned: 33, required: 39, remaining: 6 },
    { name: '2트랙', earned: 27, required: 39, remaining: 12 },
    { name: '교양', earned: 25, required: 31, remaining: 6 },
    { name: '기타', earned: 13, required: 21, remaining: 8 },
    { name: '별도 인정 학점', earned: null, required: null, remaining: null },
  ],
  completed: [
    { code: 'SAMPLE-001', name: '예시 전공기초', credits: 3, term: '2024년 1학기' },
  ],
};

export const courses = [
  {
    code: 'SAMPLE-004',
    name: '예시 전공필수 3',
    credits: 3,
    track: profile.tracks[0],
    recognition: [{ track: profile.tracks[0], area: '전공필수' }],
    missingRequired: true,
    reason: '1트랙 전공필수 미이수 과목으로 가정한 추천 예시입니다.',
  },
  {
    code: 'SAMPLE-007',
    name: '예시 전공선택 3',
    credits: 3,
    track: profile.tracks[0],
    recognition: profile.tracks.map(track => ({ track, area: '전공선택' })),
    missingRequired: false,
    reason: '1·2트랙 전공선택 인정 후보로 가정한 추천 예시입니다.',
  },
];

export const terms = [
  { id: '4-1', label: '4학년 1학기' },
  { id: '4-2', label: '4학년 2학기' },
];
