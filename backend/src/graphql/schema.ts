import { gql } from 'apollo-server';

const typeDefs = gql`
  type User {
    id: ID!
    fullName: String!
    email: String!
    transactions: [Transaction!]!
    categories: [Category!]!
  }

  type Category {
    id: ID!
    name: String!
    description: String!
    icon: String!
    color: String!
    userId: ID!
    transactions: [Transaction!]!
  }

  type Transaction {
    id: ID!
    amount: Float!
    type: TransactionType!
    description: String!
    categoryId: ID!
    userId: ID!
    createdAt: String!
    updatedAt: String!
    category: Category!
  }

  type Query {
    me: User
    categories: [Category!]!
    transactions: [Transaction!]!
  }

  type Mutation {
    signUp(fullName: String!, email: String!, password: String!): User!
    signIn(email: String!, password: String!): AuthPayload!
    createCategory(name: String!, description: String, icon: String, color: String): Category!
    editCategory(id: ID!, name: String!, description: String, icon: String, color: String): Category!
    deleteCategory(id: ID!): Boolean!
    createTransaction(amount: Float!, description: String!, categoryId: ID!, type: TransactionType!): Transaction!
    editTransaction(id: ID!, amount: Float, description: String, categoryId: ID, type: TransactionType): Transaction!
    deleteTransaction(id: ID!): Boolean!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  enum TransactionType {
    EXPENSE
    INCOME
  }
`;

export { typeDefs };
export default typeDefs;