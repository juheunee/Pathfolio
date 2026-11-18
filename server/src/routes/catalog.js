// 로그인 없이도 보는 공통 정보: 트랙, 교과목, 비교과
import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { notFound, parseOrThrow } from "../errors.js";

export const catalogRouter = Router();

// GET /api/tracks
catalogRouter.get("/tracks", async (req, res) => {
  const tracks = await prisma.track.findMany({ orderBy: { id: "asc" } });
  res.json({ data: tracks });
});

// GET /api/courses?q=검색어&trackId=1
const courseQuery = z.object({
  q: z.string().trim().optional(),
  trackId: z.coerce.number().int().positive().optional(),
});

catalogRouter.get("/courses", async (req, res) => {
  const { q, trackId } = parseOrThrow(courseQuery, req.query);
  const courses = await prisma.course.findMany({
    where: {
      ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
      ...(trackId ? { rules: { some: { trackId } } } : {}),
    },
    include: { rules: { include: { track: { select: { id: true, name: true } } } } },
    orderBy: { code: "asc" },
  });
  res.json({ data: courses });
});

// GET /api/courses/:code
catalogRouter.get("/courses/:code", async (req, res) => {
  const course = await prisma.course.findUnique({
    where: { code: req.params.code },
    include: {
      rules: { include: { track: { select: { id: true, name: true } } } },
      prerequisites: { include: { prerequisite: { select: { code: true, name: true } } } },
    },
  });
  if (!course) throw notFound("과목을 찾을 수 없습니다.");
  res.json({ data: course });
});

// GET /api/extracurricular/categories
catalogRouter.get("/extracurricular/categories", async (req, res) => {
  const categories = await prisma.extracurricularCategory.findMany({ orderBy: { id: "asc" } });
  res.json({ data: categories });
});

// GET /api/extracurricular/programs?categoryId=1
const programQuery = z.object({
  categoryId: z.coerce.number({ error: "categoryId 가 필요합니다." }).int().positive(),
});

catalogRouter.get("/extracurricular/programs", async (req, res) => {
  const { categoryId } = parseOrThrow(programQuery, req.query);
  const programs = await prisma.extracurricularProgram.findMany({
    where: { categoryId },
    orderBy: { createdAt: "desc" },
  });
  res.json({ data: programs });
});