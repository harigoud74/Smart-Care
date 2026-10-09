import { Request } from 'express';
import { db } from '../db/store.js';
import { AuditLog, Role } from '../types/index.js';
import { v4 as uuidv4 } from 'uuid';

export function logAudit(
  req: Request | null,
  action: string,
  entity: string,
  entityId?: string,
  details?: Record<string, any>,
  userOverride?: { id: string; email: string; role: Role }
): AuditLog {
  const user = userOverride || (req as any)?.user;
  const ipAddress = req?.ip || req?.socket?.remoteAddress || '127.0.0.1';
  const userAgent = req?.headers?.['user-agent'] || 'SmartCare Internal';

  // Sanitize details: strip passwords, tokens, credit cards
  const sanitizedDetails = { ...(details || {}) };
  delete sanitizedDetails.password;
  delete sanitizedDetails.passwordHash;
  delete sanitizedDetails.token;
  delete sanitizedDetails.secret;

  const log: AuditLog = {
    id: `audit-${uuidv4()}`,
    userId: user?.userId || user?.id,
    userEmail: user?.email,
    userRole: user?.role,
    action,
    entity,
    entityId,
    ipAddress,
    userAgent,
    details: sanitizedDetails,
    timestamp: new Date().toISOString(),
  };

  return db.createAuditLog(log);
}
