import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();
app.use(
  express.json({
    limit: "16kb",
  }),
);
app.use(cookieParser({}));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(
  cors({
    credentials: true,
    origin: process.env.CORS_ORIGIN || "*",
  }),
);
app.use(express.static("public"));
