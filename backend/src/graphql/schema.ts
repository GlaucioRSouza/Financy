import { gql } from 'apollo-server';

const typeDefs = gql`
  type User {
    id: ID!
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
    me: User
    categories: [Category!]!
    transactions: [Transaction!]!
  }

  type Mutation {
    signUp(email: String!, password: String!): User!
    signIn(email: String!, password: String!): AuthPayload!
    createCategory(name: String!): Category!
    editCategory(id: ID!, name: String!): Category!
    deleteCategory(id: ID!): Boolean!
    createTransaction(amount: Float!, description: String!, categoryId: ID!): Transaction!
    editTransaction(id: ID!, amount: Float, description: String): Transaction!
    deleteTransaction(id: ID!): Boolean!
  }

  type AuthPayload {
    token: String!
    user: User!
  }
`;

export { typeDefs };
export default typeDefs;