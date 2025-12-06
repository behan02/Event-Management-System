import express from "express";
import { login, logout, refresh, signup, getUserProfile } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh", refresh);
router.get("/profile", protectRoute, getUserProfile);

export default router;