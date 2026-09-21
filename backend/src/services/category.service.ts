import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const categoryService = {
  createCategory: async (userId: string, name: string) => {
    return await prisma.category.create({
      data: {
        name,
        userId,
      },
    });
  },

  updateCategory: async (id: string, userId: string, name: string) => {
    return await prisma.category.updateMany({
      where: {
        id,
        userId,
      },
      data: {
        name,
      },
    });
  },

  deleteCategory: async (id: string, userId: string) => {
    return await prisma.category.deleteMany({
      where: {
        id,
        userId,
      },
    });
  },

  getCategoriesByUserId: async (userId: string) => {
    return await prisma.category.findMany({
      where: {
        userId,
      },
    });
  },
};