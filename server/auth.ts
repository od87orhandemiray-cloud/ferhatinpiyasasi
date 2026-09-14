import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import { requireDb } from "./db";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-degistir-prod-ortaminda";
const COOKIE_NAME = "session";
const STARTING_BALANCE = 100000; // sanal TL

export interface AuthedRequest extends Request {
  userId?: number;
}

export function signToken(userId: number): string {
  return jwt.sign({ uid: userId }, JWT_SECRET, { expiresIn: "30d" });
}

export function setSessionCookie(res: Response, token: string) {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
}

export function clearSessionCookie(res: Response) {
  res.clearCookie(COOKIE_NAME);
}

// İstek üzerinde geçerli bir oturum varsa userId'yi ekler; yoksa dokunmaz.
export function attachUser(req: AuthedRequest, _res: Response, next: NextFunction) {
  const token = req.cookies?.[COOKIE_NAME];
  if (token) {
    try {
      const payload = jwt.verify(token, JWT_SECRET) as { uid: number };
      req.userId = payload.uid;
    } catch {
      // geçersiz/eski token -> sessizce yok say
    }
  }
  next();
}

// Bu route'un çalışması için oturum ZORUNLU.
export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  if (!req.userId) {
    return res.status(401).json({ status: "error", message: "Giriş yapmanız gerekiyor." });
  }
  next();
}

export async function registerUser(email: string, password: string, displayName: string) {
  const db = requireDb();
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail || !password || password.length < 6) {
    throw new Error("Geçerli bir e-posta ve en az 6 karakterli bir şifre gerekli.");
  }

  const existing = await db.query("SELECT id FROM users WHERE email = $1", [normalizedEmail]);
  if (existing.rows.length > 0) {
    throw new Error("Bu e-posta ile zaten bir hesap var.");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const client = await db.connect();
  try {
    await client.query("BEGIN");
    const userResult = await client.query(
      "INSERT INTO users (email, password_hash, display_name) VALUES ($1, $2, $3) RETURNING id, email, display_name",
      [normalizedEmail, passwordHash, displayName || normalizedEmail.split("@")[0]]
    );
    const user = userResult.rows[0];
    await client.query(
      "INSERT INTO wallets (user_id, balance) VALUES ($1, $2)",
      [user.id, STARTING_BALANCE]
    );
    await client.query("COMMIT");
    return user;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function verifyLogin(email: string, password: string) {
  const db = requireDb();
  const normalizedEmail = email.trim().toLowerCase();
  const result = await db.query(
    "SELECT id, email, display_name, password_hash FROM users WHERE email = $1",
    [normalizedEmail]
  );
  const user = result.rows[0];
  if (!user) throw new Error("E-posta veya şifre hatalı.");

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) throw new Error("E-posta veya şifre hatalı.");

  return { id: user.id, email: user.email, displayName: user.display_name };
}
