import express from "express";
import dotenv from "dotenv";
import { db } from "./libs/db.js";
import cookieParser from "cookie-parser";
import cors from "cors";

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

import authRoutes from "./routes/auth.routes.js";
import taskRoutes from "./routes/task.route.js";
import userRoutes from "./routes/user.routes.js";

const PORT = process.env.PORT || 8000;

app.use(
  cors({
    origin: "https://task-frontend-vhta.onrender.com/",
    credentials: true,
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/users", userRoutes);

app.get("/", (req, res) => {
  res.send("Hello, world!");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
