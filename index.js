const { ApolloServer, gql } = require("apollo-server");
const mongoose = require('mongoose');
const User = require('./schemas/User');

mongoose.connect('mongodb://35.222.204.58:27017/jam', {useNewUrlParser: true});


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

  type User {
    name: Name
    username: String
    email: String
    xp:
  }
`;

// Provide resolver functions for your schema fields
const resolvers = {
  Query: {
    hello: (root, args, context) => "Hello world!",
  },
  Mutation: {
    login: async (root, {username, password}, ctx) => {
        let attemptedUser = await User.findOne({username, password}, 'name username email xp coins base');

    },
    register: async (root, {first, last, username, password, email}, ctx) => {
        let newUser = new User(
          {
            name: { first, last },
            username,
            password,
            email,
          }
        );
        await newUser.save();
        // generate JWT
        // return JWT
        return "jwt";
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
