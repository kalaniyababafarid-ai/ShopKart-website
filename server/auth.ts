import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { db } from './db';
import { User } from './types';

const JWT_SECRET = process.env.JWT_SECRET || 'shopkart-secret-jwt-key-production-grade-2026';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

// Token format: base64(payload).signature
export function createToken(user: User): string {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    issuedAt: Date.now(),
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(encodedPayload)
    .digest('base64url');
  return `${encodedPayload}.${signature}`;
}

export function verifyToken(token: string): { userId: string; email: string; role: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [encodedPayload, signature] = parts;

    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(encodedPayload)
      .digest('base64url');

    if (signature !== expectedSignature) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf-8'));
    return payload;
  } catch {
    return null;
  }
}

export function authMiddleware(req: AuthenticatedRequest, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.substring(7).trim();
  const decoded = verifyToken(token);
  if (!decoded) {
    return next();
  }

  const database = db.get();
  const user = database.users.find((u) => u.id === decoded.userId);
  if (user) {
    req.user = user;
  }
  next();
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required. Please sign in to continue.' });
    return;
  }
  next();
}

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ error: 'Access denied. Administrative privileges are required.' });
    return;
  }
  next();
}

export { bcrypt };
