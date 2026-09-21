import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const TransactionService = {
    createTransaction: async (userId: string, categoryId: string, amount: number, description: string, type: string) => {
        return await prisma.transaction.create({
            data: {
                userId: Number(userId),
                categoryId: Number(categoryId),
                amount,
                title: description,
                type,
            },
            include: { category: true },
        });
    },

    editTransaction: async (transactionId: string, userId: string, data: Partial<{ categoryId: string; amount: number; description: string; type: string }>) => {
        return await prisma.transaction.updateMany({
            where: {
                id: Number(transactionId),
                userId: Number(userId),
            },
            data: {
                ...(data.categoryId !== undefined && { categoryId: Number(data.categoryId) }),
                ...(data.amount !== undefined && { amount: data.amount }),
                                ...(data.type !== undefined && { type: data.type }),
                ...(data.description !== undefined && { title: data.description }),
            },
        });
    },

    deleteTransaction: async (transactionId: string, userId: string) => {
        return await prisma.transaction.deleteMany({
            where: {
                id: Number(transactionId),
                userId: Number(userId),
            },
        });
    },

    listTransactions: async (userId: string) => {
        return await prisma.transaction.findMany({
            where: {
                userId: Number(userId),
            },
            include: { category: true },
        });
    },
};