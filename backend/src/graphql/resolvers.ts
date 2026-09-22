import { AuthService } from '../services/auth.service';
import { categoryService as CategoryService } from '../services/category.service';
import { TransactionService } from '../services/transaction.service';

const resolvers = {
  Transaction: {
    description: (transaction: { title: string }) => transaction.title,
  },
  Query: {
    me: async (_: unknown, __: unknown, { user }: any) => {
      if (!user) throw new Error('Not authenticated');
      return AuthService.getUserById(user.id);
    },
    categories: async (_: unknown, __: unknown, { user }: any) => {
      if (!user) throw new Error('Not authenticated');
      return CategoryService.getCategoriesByUserId(String(user.id));
    },
    transactions: async (_: unknown, __: unknown, { user }: any) => {
      if (!user) throw new Error('Not authenticated');
      return TransactionService.listTransactions(String(user.id));
    },
  },
  Mutation: {
    signUp: async (_: unknown, { fullName, email, password }: any) => {
      return AuthService.signUp(fullName, email, password);
    },
    signIn: async (_: unknown, { email, password }: any) => {
      return AuthService.signIn(email, password);
    },
    createCategory: async (_: unknown, { name, description, icon, color }: any, { user }: any) => {
      if (!user) throw new Error('Not authenticated');
      return CategoryService.createCategory(String(user.id), name, description ?? '', icon ?? 'wallet', color ?? 'green');
    },
    editCategory: async (_: unknown, { id, name, description, icon, color }: any, { user }: any) => {
      if (!user) throw new Error('Not authenticated');
      return CategoryService.updateCategory(id, String(user.id), name, description ?? '', icon ?? 'wallet', color ?? 'green');
    },
    deleteCategory: async (_: unknown, { id }: any, { user }: any) => {
      if (!user) throw new Error('Not authenticated');
      const result = await CategoryService.deleteCategory(id, String(user.id));
      return result.count > 0;
    },
    createTransaction: async (_: unknown, { amount, description, categoryId, type }: any, { user }: any) => {
      if (!user) throw new Error('Not authenticated');
      return TransactionService.createTransaction(String(user.id), categoryId, amount, description, type);
    },
    editTransaction: async (_: unknown, { id, amount, description, categoryId, type }: any, { user }: any) => {
      if (!user) throw new Error('Not authenticated');
      return TransactionService.editTransaction(id, String(user.id), { amount, description, categoryId, type });
    },
    deleteTransaction: async (_: unknown, { id }: any, { user }: any) => {
      if (!user) throw new Error('Not authenticated');
      return Boolean(await TransactionService.deleteTransaction(id, String(user.id)));
    },
  },
};

export default resolvers;