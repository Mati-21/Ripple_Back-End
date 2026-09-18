import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import fileUplaod from "express-fileupload";
import compression from "compression";
import morgan from "morgan";
import createHttpError from "http-errors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// importing routes
import routes from "./routes/index.route.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, "public", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// initializing app
const app = express();

//morgan middleware
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// json body parser
app.use(express.json());

// url parser
app.use(express.urlencoded({ extended: true }));

// cookie-parser
app.use(cookieParser());

// compression
app.use(compression());

// fileuplad
app.use(fileUplaod({ useTempFiles: true }));

// static uploads serving
app.use("/uploads", express.static(uploadDir));

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174", // add more as needed
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like Postman or server-to-server)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // Allow cookies
  })
)

//routes
app.use("/api/v1", routes);

// page not found

app.use((req, res, next) => {
  next(createHttpError.NotFound("This route does not exist"));
});

app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    error: {
      message: err.message || "Internal server error",
      status: err.status || 500,
    },
  });
});

// exporting app
export default app;
