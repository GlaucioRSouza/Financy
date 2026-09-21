import { Request, Response } from 'express';
import { getUserFromToken } from '../utils/jwt';

interface Context {
  req: Request;
  res: Response;
  user?: { id: string; email: string }; // Adicione outros campos conforme necessário
}

const createContext = ({ req, res }: { req: Request; res: Response }): Context => {
  const token = req.headers.authorization || '';
  const user = getUserFromToken(token); // Função que decodifica o token e retorna o usuário

  return { req, res, user };
};

export default createContext;