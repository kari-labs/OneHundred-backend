const { ApolloServer, gql } = require("apollo-server");
const bcrypt = require("bcrypt");
const mongoose = require('mongoose');
const User = require('./schemas/User');

mongoose.connect('mongodb://35.222.204.58:27017/jam', { useNewUrlParser: true });

const saltRounds = 10;

// Construct a schema, using GraphQL schema language
const typeDefs = gql`
  type Query {
    hello: String
  }

  type Mutation {
    login(username: String, password: String): User
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
    xp: Float
    coins: Int
    base: String
  }

  type Name {
    first: String
    last: String
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
        return attemptedUser;

    },
    register: async (root, { first, last, username, password, email }, ctx) => {
      let hash = await bcrypt.hash(password, saltRounds);
      let newUser = new User(
        {
          name: { first, last },
          username,
          hash,
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
