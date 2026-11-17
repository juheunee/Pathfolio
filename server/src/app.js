// 서버 메인: 어떤 주소로 오면 어떤 코드가 처리할지 연결한다
import express from "express";
import cors from "cors";
import { authRouter } from "./routes/auth.js";
import { catalogRouter } from "./routes/catalog.js";
import { meRouter } from "./routes/me.js";
import { notFoundHandler, errorHandler } from "./errors.js";

export const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173" }));
app.use(express.json());

// 서버가 살아 있는지 확인용
app.get("/api/health", (req, res) => {
  res.json({ data: { status: "ok", time: new Date().toISOString() } });
});

app.use("/api/auth", authRouter);
app.use("/api/me", meRouter);
app.use("/api", catalogRouter);

app.use(notFoundHandler);
app.use(errorHandler);