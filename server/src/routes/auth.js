// 로그인·로그아웃
import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../db.js";
import { signToken, requireAuth } from "../auth.js";
import { parseOrThrow, unauthorized } from "../errors.js";

export const authRouter = Router();

const loginSchema = z.object({
  loginId: z.string({ error: "아이디를 입력해 주세요." }).trim().min(1, "아이디를 입력해 주세요."),
  password: z.string({ error: "비밀번호를 입력해 주세요." }).min(1, "비밀번호를 입력해 주세요."),
});

// POST /api/auth/login
authRouter.post("/login", async (req, res) => {
  const { loginId, password } = parseOrThrow(loginSchema, req.body ?? {});
  const account = await prisma.account.findUnique({ where: { loginId } });
  const ok = account && (await bcrypt.compare(password, account.passwordHash));
  if (!ok) throw unauthorized("아이디 또는 비밀번호가 올바르지 않습니다.");

  res.json({
    data: {
      token: signToken(account.id),
      account: { id: account.id, loginId: account.loginId, displayName: account.displayName },
    },
  });
});

// POST /api/auth/logout
authRouter.post("/logout", requireAuth, (req, res) => {
  res.status(204).end();
});