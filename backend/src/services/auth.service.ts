import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { generateToken, verifyToken } from '../utils/jwt';

const prisma = new PrismaClient();

export const AuthService = {
  async signUp(email: string, password: string) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });
    return user;
  },

  async signIn(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new Error('Invalid credentials');
    }

    const token = generateToken(String(user.id));
    return { token, user };
  },

  async validateToken(token: string) {
    try {
      const payload = verifyToken(token);
      return payload;
    } catch (error) {
      throw new Error('Invalid token');
    }
  },
};