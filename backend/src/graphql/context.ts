import { Request, Response } from 'express';
import { verifyToken } from '../utils/jwt';

interface Context {
  req: Request;
  res: Response;
  user?: unknown;
}

const createContext = ({ req, res }: { req: Request; res: Response }): Context => {
  const token = req.headers.authorization || '';
  const user = verifyToken(token.replace(/^Bearer\s+/i, ''));

  return { req, res, user };
};

export default createContext;