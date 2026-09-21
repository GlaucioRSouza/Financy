import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { createServer } from 'http';
import schema from './graphql/index';
import resolvers from './graphql/resolvers';
import createContext from './graphql/context';
import cors from 'cors';

const app = express();
const httpServer = createServer(app);

app.use(cors());
app.use(express.json());

const server = new ApolloServer({
    schema,
    resolvers,
    context: ({ req, res }) => createContext({ req, res }),
});

const PORT = process.env.PORT || 4000;

async function startServer() {
    await server.start();
    server.applyMiddleware({ app });
    httpServer.listen(PORT, () => {
        console.log(`Server ready at http://localhost:${PORT}${server.graphqlPath}`);
    });
}

startServer();