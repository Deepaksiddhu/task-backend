import express from "express";
import {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask
} from "../controllers/task.controller.js";

import { authMiddleware, checkAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

// ✅ Admin only
router.post("/create", authMiddleware, checkAdmin, createTask);

// ✅ Admin: All tasks, User: only their tasks
router.get("/get-task", authMiddleware, getAllTasks);

// ✅ Admin/User (based on ownership)
router.get("/:id", authMiddleware, getTaskById);

// ✅ Admin only
router.put("/:id", authMiddleware, checkAdmin, updateTask);

// ✅ Admin only
router.delete("/:id", authMiddleware, checkAdmin, deleteTask);

export default router;
