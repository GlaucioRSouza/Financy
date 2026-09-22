import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const categoryService = {
  createCategory: async (userId: string, name: string, description: string, icon: string, color: string) => {
    return await prisma.category.create({
      data: {
        name,
        description,
        icon,
        color,
        userId: Number(userId),
      },
    });
  },

  updateCategory: async (id: string, userId: string, name: string, description: string, icon: string, color: string) => {
    return await prisma.category.update({
      where: {
        id: Number(id),
        userId: Number(userId),
      },
      data: { name, description, icon, color },
    });
  },

  deleteCategory: async (id: string, userId: string) => {
    return await prisma.category.deleteMany({
      where: {
        id: Number(id),
        userId: Number(userId),
      },
    });
  },

  getCategoriesByUserId: async (userId: string) => {
    return await prisma.category.findMany({
      where: {
        userId: Number(userId),
      },
    });
  },
};