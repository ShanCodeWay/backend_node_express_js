import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import http from "http";
import path from "path";
import morgan from "morgan";
import dotenv from "dotenv";
import compression from "compression";
import cookieParser from "cookie-parser";
import { fileURLToPath } from "url";

import routes from "./routes/index.js";
import globalErrorHandler from "./controllers/errorController.js";
import AppError from "./utils/appError.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, ".", ".env.local"),
});

const app = express();

// ? DEVELOPMENT REQUEST LOGGING
if (process.env.NODE_ENV?.trim() === "development") {
  app.use(morgan("dev"));
}

//  ? COMPRESS ALL RESPONSES
app.use(compression());

// ? PARSE COOKIES
app.use(cookieParser());

// ? PARSE REQUESTS OF CONTENT-TYPE - APPLICATION/JSON
app.use(bodyParser.json());

const server = http.createServer(app);

const SERVER_PORT = process.env.PORT || 8080;

server.listen(SERVER_PORT, () => {
  console.log(
    `Server is running on  http://localhost:${SERVER_PORT}`
  );
});

mongoose.connect(process.env.MONGODB_URL);

mongoose.connection.on("connected", () => {
  console.log("Connected to MongoDB");
});

mongoose.connection.on("error", (err) => {
  console.log("Error connecting to MongoDB", err);
});

// ROUTES
app.use("/", routes());

// HANDLE UNHANDLED ROUTES
app.all("*", (req, res, next) => {
  next(
    new AppError(
      `Can't find ${req.originalUrl} on this server`,
      404
    )
  );
});

// GLOBAL ERROR HANDLER
app.use(globalErrorHandler);
