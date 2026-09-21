import { Request, Response } from 'express';
import { verifyToken } from '../utils/jwt';

interface Context {
  req: Request;
  res: Response;
  user?: { id: string };
}

const createContext = ({ req, res }: { req: Request; res: Response }): Context => {
  const authorization = req.headers.authorization || '';
  const payload = verifyToken(authorization.replace(/^Bearer\s+/i, ''));
  const user = payload && typeof payload !== 'string' && 'userId' in payload
    ? { id: String(payload.userId) }
    : undefined;

  return { req, res, user };
};

export default createContext;
