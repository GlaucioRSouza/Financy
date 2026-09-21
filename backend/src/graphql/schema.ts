import { gql } from 'apollo-server';

const typeDefs = gql`
  type User {
    id: ID!
    username: String!
    email: String!
    transactions: [Transaction!]!
    categories: [Category!]!
  }

  type Category {
    id: ID!
    name: String!
    userId: ID!
    transactions: [Transaction!]!
  }

  type Transaction {
    id: ID!
    amount: Float!
    description: String!
    categoryId: ID!
    userId: ID!
    createdAt: String!
    updatedAt: String!
  }

  type Query {
    getUser(id: ID!): User
    listCategories: [Category!]!
    listTransactions: [Transaction!]!
  }

  type Mutation {
    signUp(username: String!, email: String!, password: String!): User!
    signIn(email: String!, password: String!): String! # Returns JWT
    createCategory(name: String!): Category!
    editCategory(id: ID!, name: String!): Category!
    deleteCategory(id: ID!): Boolean!
    createTransaction(amount: Float!, description: String!, categoryId: ID!): Transaction!
    editTransaction(id: ID!, amount: Float, description: String): Transaction!
    deleteTransaction(id: ID!): Boolean!
  }
`;

export default typeDefs;