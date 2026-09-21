import { IResolvers } from 'graphql-tools';
import { User } from '../prisma/generated/type-graphql'; // Ajuste o caminho conforme necessário
import { Category } from '../prisma/generated/type-graphql'; // Ajuste o caminho conforme necessário
import { Transaction } from '../prisma/generated/type-graphql'; // Ajuste o caminho conforme necessário
import { AuthService } from '../services/auth.service';
import { CategoryService } from '../services/category.service';
import { TransactionService } from '../services/transaction.service';

const authService = new AuthService();
const categoryService = new CategoryService();
const transactionService = new TransactionService();

const resolvers: IResolvers = {
  Query: {
    me: async (_: any, __: any, { userId }: { userId: string }) => {
      if (!userId) throw new Error('Not authenticated');
      return await authService.getUserById(userId);
    },
    categories: async (_: any, __: any, { userId }: { userId: string }) => {
      if (!userId) throw new Error('Not authenticated');
      return await categoryService.getCategoriesByUserId(userId);
    },
    transactions: async (_: any, __: any, { userId }: { userId: string }) => {
      if (!userId) throw new Error('Not authenticated');
      return await transactionService.getTransactionsByUserId(userId);
    },
  },
  Mutation: {
    signUp: async (_: any, { input }: { input: any }) => {
      return await authService.signUp(input);
    },
    signIn: async (_: any, { input }: { input: any }) => {
      return await authService.signIn(input);
    },
    createCategory: async (_: any, { input }: { input: any }, { userId }: { userId: string }) => {
      if (!userId) throw new Error('Not authenticated');
      return await categoryService.createCategory(input, userId);
    },
    updateCategory: async (_: any, { id, input }: { id: string; input: any }, { userId }: { userId: string }) => {
      if (!userId) throw new Error('Not authenticated');
      return await categoryService.updateCategory(id, input, userId);
    },
    deleteCategory: async (_: any, { id }: { id: string }, { userId }: { userId: string }) => {
      if (!userId) throw new Error('Not authenticated');
      return await categoryService.deleteCategory(id, userId);
    },
    createTransaction: async (_: any, { input }: { input: any }, { userId }: { userId: string }) => {
      if (!userId) throw new Error('Not authenticated');
      return await transactionService.createTransaction(input, userId);
    },
    updateTransaction: async (_: any, { id, input }: { id: string; input: any }, { userId }: { userId: string }) => {
      if (!userId) throw new Error('Not authenticated');
      return await transactionService.updateTransaction(id, input, userId);
    },
    deleteTransaction: async (_: any, { id }: { id: string }, { userId }: { userId: string }) => {
      if (!userId) throw new Error('Not authenticated');
      return await transactionService.deleteTransaction(id, userId);
    },
  },
};

export default resolvers;