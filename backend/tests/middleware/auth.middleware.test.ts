/**
 * Session handling: cookie-first token extraction, rejection of forged or
 * revoked tokens, and cookie flags that match between set and clear (mismatched
 * flags mean clearCookie silently fails to log anyone out).
 */

process.env.JWT_SECRET = 'test-secret-that-is-at-least-32-characters-long';

import jwt from 'jsonwebtoken';
import type { Response } from 'express';
import {
  authMiddleware,
  generateToken,
  setSessionCookie,
  clearSessionCookie,
  AuthRequest,
} from '../../src/middleware/auth.middleware';
import { config } from '../../src/config';

function mockRequest(overrides: Partial<AuthRequest> = {}): AuthRequest {
  return { cookies: {}, headers: {}, ...overrides } as AuthRequest;
}

function mockResponse() {
  const res = {} as Response & {
    status: jest.Mock;
    json: jest.Mock;
    cookie: jest.Mock;
    clearCookie: jest.Mock;
  };
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.cookie = jest.fn().mockReturnValue(res);
  res.clearCookie = jest.fn().mockReturnValue(res);
  return res;
}

describe('authMiddleware', () => {
  it('rejects a request with no token', async () => {
    const res = mockResponse();
    const next = jest.fn();

    await authMiddleware(mockRequest(), res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Authentication required' });
    expect(next).not.toHaveBeenCalled();
  });

  it('accepts a valid session cookie and populates the request', async () => {
    const token = generateToken({ userId: 'user-123', email: 'user@example.com' });
    const req = mockRequest({ cookies: { [config.cookie.name]: token } });
    const res = mockResponse();
    const next = jest.fn();

    await authMiddleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(req.userId).toBe('user-123');
    expect(req.userEmail).toBe('user@example.com');
    expect(req.token).toBe(token);
  });

  it('accepts a Bearer token for server-to-server callers', async () => {
    const token = generateToken({ userId: 'user-456', email: 'svc@example.com' });
    const req = mockRequest({ headers: { authorization: `Bearer ${token}` } });
    const res = mockResponse();
    const next = jest.fn();

    await authMiddleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.userId).toBe('user-456');
  });

  it('prefers the cookie over the Authorization header', async () => {
    const cookieToken = generateToken({ userId: 'from-cookie', email: 'c@example.com' });
    const headerToken = generateToken({ userId: 'from-header', email: 'h@example.com' });
    const req = mockRequest({
      cookies: { [config.cookie.name]: cookieToken },
      headers: { authorization: `Bearer ${headerToken}` },
    });
    const res = mockResponse();

    await authMiddleware(req, res, jest.fn());

    expect(req.userId).toBe('from-cookie');
  });

  it('rejects a token signed with the wrong secret', async () => {
    const forged = jwt.sign({ userId: 'attacker', email: 'a@example.com' }, 'not-the-real-secret');
    const req = mockRequest({ cookies: { [config.cookie.name]: forged } });
    const res = mockResponse();
    const next = jest.fn();

    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid or expired token' });
    expect(next).not.toHaveBeenCalled();
  });

  it('rejects an expired token', async () => {
    const expired = jwt.sign(
      { userId: 'user-123', email: 'user@example.com' },
      config.jwt.secret,
      { expiresIn: '-1s' }
    );
    const req = mockRequest({ cookies: { [config.cookie.name]: expired } });
    const res = mockResponse();
    const next = jest.fn();

    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('rejects a malformed token', async () => {
    const req = mockRequest({ cookies: { [config.cookie.name]: 'not-a-jwt' } });
    const res = mockResponse();
    const next = jest.fn();

    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('rejects a token that has been revoked', async () => {
    const token = generateToken({ userId: 'user-123', email: 'user@example.com' });
    const req = mockRequest({ cookies: { [config.cookie.name]: token } });
    const res = mockResponse();
    const next = jest.fn();

    const denylist = require('../../src/services/tokenDenylist');
    jest.spyOn(denylist, 'isTokenRevoked').mockResolvedValue(true);

    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Session has been revoked' });
    expect(next).not.toHaveBeenCalled();
  });
});

describe('generateToken', () => {
  it('signs a verifiable token carrying the payload', () => {
    const token = generateToken({ userId: 'user-123', email: 'user@example.com' });

    const decoded = jwt.verify(token, config.jwt.secret) as Record<string, unknown>;

    expect(decoded.userId).toBe('user-123');
    expect(decoded.email).toBe('user@example.com');
    expect(decoded.exp).toBeDefined();
  });
});

describe('session cookie flags', () => {
  it('sets the session cookie httpOnly with a path and max age', () => {
    const res = mockResponse();

    setSessionCookie(res, 'the-token');

    expect(res.cookie).toHaveBeenCalledWith(
      config.cookie.name,
      'the-token',
      expect.objectContaining({ httpOnly: true, path: '/', maxAge: config.cookie.maxAgeMs })
    );
  });

  it('clears with flags matching the ones used to set it', () => {
    const setRes = mockResponse();
    const clearRes = mockResponse();

    setSessionCookie(setRes, 'the-token');
    clearSessionCookie(clearRes);

    // Browsers only drop a cookie when these match; a divergence here means
    // logout appears to succeed while the session cookie survives.
    const setFlags = setRes.cookie.mock.calls[0][2];
    const clearFlags = clearRes.clearCookie.mock.calls[0][1];

    expect(clearRes.clearCookie.mock.calls[0][0]).toBe(config.cookie.name);
    for (const flag of ['httpOnly', 'secure', 'sameSite', 'domain', 'path'] as const) {
      expect(clearFlags[flag]).toEqual(setFlags[flag]);
    }
  });
});
