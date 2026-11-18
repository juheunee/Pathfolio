// 서버 시작 파일: pnpm dev 를 실행하면 여기부터 시작한다
import { app } from "./app.js";

for (const name of ["DATABASE_URL", "JWT_SECRET"]) {
  if (!process.env[name]) {
    console.error(`[설정 오류] server/.env 에 ${name} 값이 없습니다. .env.example 을 참고하세요.`);
    process.exit(1);
  }
}

const port = Number(process.env.PORT ?? 4000);
app.listen(port, () => {
  console.log(`Pathfolio 서버 실행 중 → http://localhost:${port}/api/health`);
});