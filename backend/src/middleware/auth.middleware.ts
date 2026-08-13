import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { isTokenRevoked } from '../services/tokenDenylist';

export interface AuthRequest extends Request {
  userId?: string;
  userEmail?: string;
  /** The raw JWT, kept so logout can revoke exactly this token. */
  token?: string;
}

export interface JwtPayload {
  userId: string;
  email: string;
  exp?: number;
}

/**
 * Extract the session JWT.
 *
 * The httpOnly cookie is the supported transport — it cannot be read by
 * JavaScript, so XSS cannot exfiltrate the session. The Authorization header is
 * still accepted for server-to-server callers and API testing.
 */
function extractToken(req: AuthRequest): string | undefined {
  const cookieToken = req.cookies?.[config.cookie.name];
  if (cookieToken) return cookieToken;

  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) return authHeader.substring(7);

  return undefined;
}

export async function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const token = extractToken(req);

  if (!token) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  let decoded: JwtPayload;
  try {
    decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
    return;
  }

  // A token can be valid and still revoked (explicit logout, account deletion).
  if (await isTokenRevoked(token)) {
    res.status(401).json({ error: 'Session has been revoked' });
    return;
  }

  req.userId = decoded.userId;
  req.userEmail = decoded.email;
  req.token = token;
  next();
}

export function generateToken(payload: Omit<JwtPayload, 'exp'>): string {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  } as jwt.SignOptions);
}

/** Set the session cookie. Single source of truth for cookie flags. */
export function setSessionCookie(res: Response, token: string): void {
  res.cookie(config.cookie.name, token, {
    httpOnly: true,
    secure: config.cookie.secure,
    sameSite: config.cookie.sameSite,
    domain: config.cookie.domain,
    maxAge: config.cookie.maxAgeMs,
    path: '/',
  });
}

/** Clear the session cookie. Flags must match setSessionCookie or it won't clear. */
export function clearSessionCookie(res: Response): void {
  res.clearCookie(config.cookie.name, {
    httpOnly: true,
    secure: config.cookie.secure,
    sameSite: config.cookie.sameSite,
    domain: config.cookie.domain,
    path: '/',
  });
}
