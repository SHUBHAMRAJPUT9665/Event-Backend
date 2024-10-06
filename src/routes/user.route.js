import { Router } from "express";
import {
  register,
  getProfile,
  logout,
  login,
} from "../controllers/user.controller.js";
import { isLoggedIn } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";
const router = Router();

router.route("/register").post(
  register
);
router.route("/login").post(login);
router.route("/logout").post(logout);
router.route("/profile").post(isLoggedIn, getProfile);
export default router;