const { ApolloServer, gql } = require("apollo-server");
const mongoose = require('mongoose');
mongoose.connect('mongodb://', {useNewUrlParser: true});


// Construct a schema, using GraphQL schema language
const typeDefs = gql`
  type Query {
    hello: String
  }

  type Mutation {
    login(username: String, password: String): String
    register(
        first:String, 
        last: String, 
        username: String, 
        password: String,
        email: String,
    ): String
    deleteUser(username: String, password: String): Boolean
  }

`;

// Provide resolver functions for your schema fields
const resolvers = {
  Query: {
    hello: (root, args, context) => "Hello world!",
  },
  Mutation: {
    login: (root, {username, password}, ctx) => {
        // check DB
        // generate jwt
        // return jwt
    },
    register: (root, {username, password}, ctx) => {
        // create user in DB
        // generate JWT
        // return JWT
    },
    // delete
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
