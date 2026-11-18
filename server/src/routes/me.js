// 개인 데이터: 학업 정보(조회 전용), 분석·추천(예시), 로드맵, 구독
import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { requireAuth } from "../auth.js";
import { notFound, parseOrThrow } from "../errors.js";
import {
  SAMPLE_META,
  graduationAnalysisSample,
  courseRecommendationsSample,
  trackComparisonSample,
  roadmapDraftSample,
} from "../samples.js";

export const meRouter = Router();
meRouter.use(requireAuth);

// ── 학업 정보 (조회 전용) ──

// GET /api/me
meRouter.get("/", async (req, res) => {
  const account = await prisma.account.findUnique({
    where: { id: req.accountId },
    omit: { passwordHash: true },
    include: { primaryTrack: true, secondaryTrack: true },
  });
  res.json({ data: account });
});

// GET /api/me/academic-records
meRouter.get("/academic-records", async (req, res) => {
  const records = await prisma.academicRecord.findMany({
    where: { accountId: req.accountId },
    include: {
      course: { select: { code: true, name: true, credits: true, liberalArea: true } },
      track: { select: { id: true, name: true } },
    },
    orderBy: [{ takenYear: "asc" }, { term: "asc" }],
  });
  const totalCredits = records.reduce((sum, r) => sum + r.earnedCredits, 0);
  res.json({ data: records, meta: { totalCredits, count: records.length } });
});

// ── 계산 기능 (이번 주는 예시 응답) ──

// GET /api/me/graduation-analysis
meRouter.get("/graduation-analysis", (req, res) => {
  res.json({ data: graduationAnalysisSample, meta: SAMPLE_META });
});

// GET /api/me/course-recommendations
meRouter.get("/course-recommendations", (req, res) => {
  res.json({ data: courseRecommendationsSample, meta: SAMPLE_META });
});

// POST /api/me/track-comparisons   body: { replaceRole, targetTrackId }
const comparisonBody = z.object({
  replaceRole: z.enum(["PRIMARY", "SECONDARY"]),
  targetTrackId: z.number().int().positive(),
});

meRouter.post("/track-comparisons", (req, res) => {
  parseOrThrow(comparisonBody, req.body ?? {});
  res.json({ data: trackComparisonSample, meta: SAMPLE_META });
});

// POST /api/me/roadmaps/draft  (저장하지 않고 초안만 돌려줌)
meRouter.post("/roadmaps/draft", (req, res) => {
  res.json({ data: roadmapDraftSample, meta: SAMPLE_META });
});

// ── 로드맵 (실제 저장) ──

const itemSchema = z.object({
  kind: z.enum(["COURSE", "EXTRACURRICULAR"]),
  courseId: z.number().int().positive().nullish(),
  programId: z.number().int().positive().nullish(),
  customTitle: z.string().trim().max(100).nullish(),
  plannedYear: z.number().int().min(1).max(4),
  plannedSemester: z.number().int().min(1).max(2),
  status: z.enum(["PLANNED", "DONE"]).default("PLANNED"),
  sortOrder: z.number().int().min(0).default(0),
}).refine(
  (i) => (i.kind === "COURSE" ? i.courseId != null : i.programId != null || !!i.customTitle),
  { message: "교과는 courseId, 비교과는 programId 또는 customTitle 이 필요합니다." },
);

const roadmapBody = z.object({
  title: z.string().trim().min(1).max(50),
  items: z.array(itemSchema).max(200).default([]),
});

const itemInclude = {
  items: {
    orderBy: [{ plannedYear: "asc" }, { plannedSemester: "asc" }, { sortOrder: "asc" }],
    include: {
      course: { select: { code: true, name: true, credits: true } },
      program: { select: { title: true, categoryId: true } },
    },
  },
};

async function findMyRoadmap(accountId, id) {
  const roadmap = await prisma.roadmap.findFirst({ where: { id, accountId }, include: itemInclude });
  if (!roadmap) throw notFound("로드맵을 찾을 수 없습니다.");
  return roadmap;
}

const idParam = z.object({ id: z.coerce.number().int().positive() });

// GET /api/me/roadmaps
meRouter.get("/roadmaps", async (req, res) => {
  const roadmaps = await prisma.roadmap.findMany({
    where: { accountId: req.accountId },
    select: { id: true, title: true, updatedAt: true, _count: { select: { items: true } } },
    orderBy: { updatedAt: "desc" },
  });
  res.json({ data: roadmaps });
});

// POST /api/me/roadmaps
meRouter.post("/roadmaps", async (req, res) => {
  const { title, items } = parseOrThrow(roadmapBody, req.body ?? {});
  const created = await prisma.roadmap.create({
    data: { accountId: req.accountId, title, items: { create: items } },
    include: itemInclude,
  });
  res.status(201).json({ data: created });
});

// GET /api/me/roadmaps/:id
meRouter.get("/roadmaps/:id", async (req, res) => {
  const { id } = parseOrThrow(idParam, req.params);
  res.json({ data: await findMyRoadmap(req.accountId, id) });
});

// PUT /api/me/roadmaps/:id  (제목과 항목 전체를 새 내용으로 교체)
meRouter.put("/roadmaps/:id", async (req, res) => {
  const { id } = parseOrThrow(idParam, req.params);
  const { title, items } = parseOrThrow(roadmapBody, req.body ?? {});
  await findMyRoadmap(req.accountId, id); // 내 로드맵인지 먼저 확인

  const updated = await prisma.$transaction(async (tx) => {
    await tx.roadmapItem.deleteMany({ where: { roadmapId: id } });
    return tx.roadmap.update({
      where: { id },
      data: { title, items: { create: items } },
      include: itemInclude,
    });
  });
  res.json({ data: updated });
});

// DELETE /api/me/roadmaps/:id
meRouter.delete("/roadmaps/:id", async (req, res) => {
  const { id } = parseOrThrow(idParam, req.params);
  await findMyRoadmap(req.accountId, id);
  await prisma.roadmap.delete({ where: { id } });
  res.status(204).end();
});

// ── 비교과 이메일 구독 ──

const categoryParam = z.object({ categoryId: z.coerce.number().int().positive() });

// GET /api/me/subscriptions
meRouter.get("/subscriptions", async (req, res) => {
  const subs = await prisma.categorySubscription.findMany({
    where: { accountId: req.accountId },
    include: { category: true },
    orderBy: { createdAt: "asc" },
  });
  res.json({ data: subs });
});

// PUT /api/me/subscriptions/:categoryId  (구독. 이미 구독 중이어도 성공)
meRouter.put("/subscriptions/:categoryId", async (req, res) => {
  const { categoryId } = parseOrThrow(categoryParam, req.params);
  const category = await prisma.extracurricularCategory.findUnique({ where: { id: categoryId } });
  if (!category) throw notFound("카테고리를 찾을 수 없습니다.");

  const sub = await prisma.categorySubscription.upsert({
    where: { accountId_categoryId: { accountId: req.accountId, categoryId } },
    create: { accountId: req.accountId, categoryId },
    update: {},
    include: { category: true },
  });
  res.json({ data: sub });
});

// DELETE /api/me/subscriptions/:categoryId  (구독 해제. 이미 해제되어 있어도 성공)
meRouter.delete("/subscriptions/:categoryId", async (req, res) => {
  const { categoryId } = parseOrThrow(categoryParam, req.params);
  await prisma.categorySubscription.deleteMany({ where: { accountId: req.accountId, categoryId } });
  res.status(204).end();
});