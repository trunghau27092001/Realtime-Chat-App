import express from "express";
import {
  signUp,
  signIn,
  signOut,
  refreshToken,
  forgotPassword,
  resetPassword,
} from "../controller/authController.js";

const router = express.Router();

router.post("/signup", signUp);
router.post("/signin", signIn);
router.post("/signout", signOut);
router.post("/refreshtoken", refreshToken);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;
