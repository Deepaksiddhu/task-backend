import express from "express";
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../controllers/user.controller.js";
import { authMiddleware, checkAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/list", authMiddleware, checkAdmin, getAllUsers);

router.get("/:id", authMiddleware, checkAdmin, getUserById);

router.put("/:id", authMiddleware, checkAdmin, updateUser);

router.delete("/:id", authMiddleware, checkAdmin, deleteUser);

export default router;
