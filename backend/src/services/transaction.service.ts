import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const TransactionService = {
    createTransaction: async (userId: string, categoryId: string, amount: number, description: string) => {
        return await prisma.transaction.create({
            data: {
                userId,
                categoryId,
                amount,
                description,
            },
        });
    },

    editTransaction: async (transactionId: string, userId: string, data: Partial<{ categoryId: string; amount: number; description: string }>) => {
        return await prisma.transaction.updateMany({
            where: {
                id: transactionId,
                userId,
            },
            data,
        });
    },

    deleteTransaction: async (transactionId: string, userId: string) => {
        return await prisma.transaction.deleteMany({
            where: {
                id: transactionId,
                userId,
            },
        });
    },

    listTransactions: async (userId: string) => {
        return await prisma.transaction.findMany({
            where: {
                userId,
            },
        });
    },
};