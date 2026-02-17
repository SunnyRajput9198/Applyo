import { v4 as uuidv4 } from 'uuid';

// Generate unique session ID for anti-abuse
export function generateSessionId(): string {
  return uuidv4();
}

// Get client IP address (anti-abuse mechanism #2)
export function getClientIP(req: any): string {
  return req.headers['x-forwarded-for']?.split(',')[0] || 
         req.connection.remoteAddress || 
         'unknown';
}