import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { createServer } from 'http';
import { schema } from './graphql/schema';
import { resolvers } from './graphql/resolvers';
import { context } from './graphql/context';
import cors from 'cors';

const app = express();
const httpServer = createServer(app);

app.use(cors());
app.use(express.json());

const server = new ApolloServer({
    schema,
    resolvers,
    context,
});

server.applyMiddleware({ app });

const PORT = process.env.PORT || 4000;

httpServer.listen(PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`);
});