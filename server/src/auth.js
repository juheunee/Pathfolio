// 로그인 토큰(JWT) 생성 및 확인
import jwt from "jsonwebtoken";
import { prisma } from "./db.js";
import { unauthorized } from "./errors.js";

const TOKEN_LIFETIME = "8h";

export function signToken(accountId) {
  return jwt.sign({ sub: String(accountId) }, process.env.JWT_SECRET, { expiresIn: TOKEN_LIFETIME });
}

// 로그인이 필요한 API 앞에 붙이는 검사
export async function requireAuth(req, res, next) {
  const header = req.get("Authorization") ?? "";
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) throw unauthorized();

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw unauthorized("로그인이 만료되었거나 올바르지 않습니다. 다시 로그인해 주세요.");
  }

  const account = await prisma.account.findUnique({ where: { id: Number(payload.sub) } });
  if (!account) throw unauthorized();

  req.accountId = account.id; // 이후 코드는 이 값으로 "내 데이터"만 다룬다
  next();
}