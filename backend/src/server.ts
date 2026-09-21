import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { createServer } from 'http';
import cors from 'cors';
import schema from './graphql/index';
import createContext from './graphql/context';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

const server = new ApolloServer({
  schema,
  context: ({ req, res }) => createContext({ req, res }),
});

const httpServer = createServer(app);

const PORT = process.env.PORT || 4000;

async function startServer() {
  await server.start();
  server.applyMiddleware({ app });
  httpServer.listen(PORT, () => {
    console.log(`Server ready at http://localhost:${PORT}${server.graphqlPath}`);
  });
}

startServer();