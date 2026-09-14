import { Router, Response } from "express";
import { requireDb } from "./db";
import {
  AuthedRequest,
  registerUser,
  verifyLogin,
  signToken,
  setSessionCookie,
  clearSessionCookie,
  requireAuth,
} from "./auth";

export function createAuthRouter() {
  const router = Router();

  router.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, displayName } = req.body;
      const user = await registerUser(email, password, displayName);
      const token = signToken(user.id);
      setSessionCookie(res, token);
      res.json({ status: "ok", user: { id: user.id, email: user.email, displayName: user.display_name } });
    } catch (err: any) {
      res.status(400).json({ status: "error", message: err.message || "Kayıt başarısız." });
    }
  });

  router.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await verifyLogin(email, password);
      const token = signToken(user.id);
      setSessionCookie(res, token);
      res.json({ status: "ok", user });
    } catch (err: any) {
      res.status(401).json({ status: "error", message: err.message || "Giriş başarısız." });
    }
  });

  router.post("/api/auth/logout", (_req, res) => {
    clearSessionCookie(res);
    res.json({ status: "ok" });
  });

  router.get("/api/auth/me", requireAuth, async (req: AuthedRequest, res: Response) => {
    const db = requireDb();
    const result = await db.query("SELECT id, email, display_name FROM users WHERE id = $1", [req.userId]);
    const user = result.rows[0];
    if (!user) return res.status(404).json({ status: "error", message: "Kullanıcı bulunamadı." });
    res.json({ status: "ok", user: { id: user.id, email: user.email, displayName: user.display_name } });
  });

  return router;
}
