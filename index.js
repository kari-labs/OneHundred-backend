const { ApolloServer, gql } = require("apollo-server");

const schemas = require('./gql/schemas');

// Construct a schema, using GraphQL schema language
const typeDefs = gql`${schemas.join('\n')}`;

// Provide resolver functions for your schema fields
const resolvers = { ...require('./gql/resolvers') };

const server = new ApolloServer({
  typeDefs,
  resolvers,
  /* rootValue: (documentAST) => {
    console.log(documentAST);
    // const { operation : op } = getOperationAST(documentAST);
    // console.log(op);
    const root = buildSchema({
      typeDefs,
      resolvers,
    });
    console.log(root);
    return null;
  }, */
});

server.listen(process.env.PORT || 4000).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
