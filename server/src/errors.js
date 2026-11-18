// 오류 응답 모양 통일: { error: { code, message, details? } }

export class HttpError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const badRequest = (message, details) => new HttpError(400, "BAD_REQUEST", message, details);
export const unauthorized = (message = "로그인이 필요합니다.") => new HttpError(401, "UNAUTHORIZED", message);
export const notFound = (message = "찾을 수 없습니다.") => new HttpError(404, "NOT_FOUND", message);

// 등록되지 않은 주소로 요청했을 때
export function notFoundHandler(req, res) {
  res.status(404).json({ error: { code: "NOT_FOUND", message: `없는 API 입니다: ${req.method} ${req.path}` } });
}

// 모든 오류가 모이는 곳
export function errorHandler(err, req, res, next) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: { code: err.code, message: err.message, details: err.details } });
  }
  if (err?.type === "entity.parse.failed") {
    return res.status(400).json({ error: { code: "BAD_REQUEST", message: "JSON 형식이 올바르지 않습니다." } });
  }
  if (err?.code === "P2003") {
    return res.status(400).json({ error: { code: "BAD_REQUEST", message: "존재하지 않는 과목·프로그램 번호가 들어 있습니다." } });
  }
  console.error(err);
  res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "서버 오류가 발생했습니다." } });
}

// zod 검사 결과를 400 오류로 바꿈
export function parseOrThrow(schema, value) {
  const result = schema.safeParse(value);
  if (!result.success) {
    const details = result.error.issues.map((i) => ({ field: i.path.join("."), message: i.message }));
    throw badRequest("입력값을 확인해 주세요.", details);
  }
  return result.data;
}