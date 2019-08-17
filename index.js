const { ApolloServer, gql } = require("apollo-server");
const bcrypt = require("bcrypt");
const mongoose = require('mongoose');
const User = require('./schemas/User');
const Base = require('./schemas/Base');
const jwt = require('jsonwebtoken');

mongoose.connect('mongodb://35.222.204.58:27017/jam', { useNewUrlParser: true });

const saltRounds = 10;
const secret = "nicoleIsACutie";

const SELECT = {
  ALL: '_id name username email xp coins base created',
  ALL_INSECURE: '_id name username password email xp coins base',
  BASIC: '_id name username email',
  BASE: {
    ALL: '_id data owner geo',
    BASIC: '_id data geo',
  }
}

// Construct a schema, using GraphQL schema language
const typeDefs = gql`
  type Query {
    hello: String
    nameOfTheGame: String
    getCurrentUser(jwt: String!): User
    refreshToken(jwt: String!): String
    getBase(jwt: String!): String
    getUserByID(_id: String!): User
    getUser(first: String, last: String, username: String): User
    getUsers(first: String, last: String, username: String): [User]!
    getUserBase(_id: String): Base
  }

  type Mutation {
    login(username: String!, password: String!): String
    register(
        first: String!,
        last: String!, 
        username: String!, 
        password: String!,
        email: String!,
    ): String
    deleteUser(username: String, password: String): Boolean

    addXP(jwt: String!, amount: Float!): Boolean
    removeXP(jwt: String!, amount: Float!): Boolean

    addCoins(jwt: String!, amount: Int!): Boolean
    removeCoins(jwt: String!, amount: Int!): Boolean

    createBase(jwt: String!, data: String!, geo: String): Boolean
    updateBase(jwt: String!, data: String, geo: String): Boolean
    deleteBase(jwt: String!): Boolean
  }

  type User {
    _id: String
    name: Name
    username: String
    email: String
    xp: Float
    coins: Int
    base: String
    _created: String
  }

  type Name {
    first: String
    last: String
  }

  type Base {
    _id: String
    data: String
    owner: String
    geo: String
  }
`;

// Provide resolver functions for your schema fields
const resolvers = {
  Query: {
    hello: (root, args, context) => "Hello world!",
    nameOfTheGame: (root, args, context) => "One Hundred Clash",
    getCurrentUser: async (root, { jwt: token }, context) => {
      let { _id } = jwt.verify(token, secret);
      let result = await User.findById(_id, SELECT.ALL);
      return result;
    },
    refreshToken: async (root, { jwt: token }, context) => {
      let { _id } = jwt.verify(token, secret);
      let refresh = await User.findById(_id, SELECT.ALL);
      return jwt.sign(refresh.toJSON(), secret);
    },
    getBase: async (root, { jwt: token }, ctx) => {
      let { _id: owner } = jwt.verify(token, secret);
      if (owner) {
        let { data } = await Base.findOne({ owner }, SELECT.BASE.ALL);
        return data;
      }
      else throw "Error: JWT Invalid";
    },
    getUserByID: async (root, { _id }, ctx) => User.findById(_id, SELECT.ALL),
    getUser: async (root, { first, last, username }, ctx) => User.findOne({
      "$or": [
        { "name.first": first },
        { "name.last": last },
        { username },
      ]
    }, SELECT.ALL),
    getUsers: async (root, args, ctx) => {
      return User.find({
        "$or": [
          { "name.first": first },
          { "name.last": last },
          { username },
        ]
      }, SELECT.ALL)
    },
    getUserBase: async (root, { _id: owner }, ctx) => Base.findOne({ owner }, SELECT.BASE.ALL)
  },
  Mutation: {
    login: async (root, { username, password }, ctx) => {
      let attemptedUser = await User.findOne({ username }, '_id name username email xp coins base password');
      let passwordMatch = await bcrypt.compare(password, attemptedUser.password);
      if (passwordMatch) {
        delete attemptedUser._doc.password;
        let token = jwt.sign(attemptedUser._doc, secret);
        return token;
      }
      else throw "Incorrect username or password";
    },
    register: async (root, { first, last, username, password, email }, ctx) => {
      let hash = await bcrypt.hash(password, saltRounds);
      let userExists = await User.findOne(
        {
          "$or": [
            { username },
            { email },
          ]
        },
        'username email'
      );
      if (!userExists) {
        let usrObj = {
          name: { first, last },
          username,
          password: hash,
          email,
        };
        let newUser = new User(usrObj);
        await newUser.save();
        let token = jwt.sign(newUser.toJSON(), secret);
        return token;
      }
      else throw "Error: a user with that username or email already exists";
    },
    addXP: async (root, { jwt: token, amount }, ctx) => {
      let { username } = jwt.verify(token, secret);
      if (username) {
        let update = await User.update({ username }, { $inc: { xp: amount } });
        if (update) return true;
        else return false;
      }
      else return false;
    },
    removeXP: async (root, { jwt: token, amount }, ctx) => {
      let { username } = jwt.verify(token, secret);
      if (username) {
        let update = await User.update({ username }, { $inc: { xp: -amount } });
        if (update) return true;
        else return false;
      }
      else return false;
    },
    addCoins: async (root, { jwt: token, amount }, ctx) => {
      let { username } = jwt.verify(token, secret);
      if (username) {
        let update = await User.update({ username }, { $inc: { coins: amount } });
        if (update) return true;
        else return false;
      }
      else throw "Error: JWT Invalid";
    },
    removeCoins: async (root, { jwt: token, amount }, ctx) => {
      let { username } = jwt.verify(token, secret);
      if (username) {
        let update = await User.update({ username }, { $inc: { coins: -amount } });
        if (update) return true;
        else return false;
      }
      else throw "Error: JWT Invalid";
    },
    createBase: async (root, { jwt: token, data, geo }, ctx) => {
      let { _id } = jwt.verify(token, secret);
      if (_id) {
        let base = new Base({
          data,
          owner: _id.toString(),
          geo,
        });
        let saving = await base.save();
        await User.update({ _id }, { base: saving._id })
        return true;
      }
      else throw "Error: JWT Invalid";
    },
    updateBase: async (root, { jwt: token, data, geo }, ctx) => {
      let { _id: owner } = jwt.verify(token, secret);
      if (owner) {
        let base = await Base.update({ owner }, (geo ? { data, geo } : { data }));
        return base ? true : false;
      }
      else throw "Error: JWT Invalid";
    },
    deleteBase: async (root, { jwt: token }, ctx) => {
      let { _id: owner } = jwt.verify(token, secret);
      if (owner) {
        let base = await Base.deleteOne({ owner });
        return base ? true : false;
      }
      else throw "Error: JWT Invalid";
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

server.listen(process.env.PORT || 4000).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
