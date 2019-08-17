const jwt = require('jsonwebtoken');

const mongoose = require('mongoose');
mongoose.connect('mongodb://35.222.204.58:27017/jam', { useNewUrlParser: true });

const User = require('../../schemas/User');
const Base = require('../../schemas/Base');
const Log = require('../../schemas/Log');

const secret = "nicoleIsACutie";

const SELECT = {
  ALL: '_id name username email xp coins base created lastLogin geo',
  ALL_INSECURE: '_id name username password email xp coins base',
  BASIC: '_id name username email',
  BASE: {
    ALL: '_id data owner geo',
    BASIC: '_id data geo',
  },
  LOG: {
    ALL: '_id by attacker attackee win duration',
    BASIC: 'by attacker attackee win duration'
  },
};

module.exports = {
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
  getUserBase: async (root, { _id: owner }, ctx) => Base.findOne({ owner }, SELECT.BASE.ALL),
  getNearbyPlayers: async (root, { jwt: token }, ctx, info) => {
    const toRadians = (num) => {
      return num * (Math.PI / 180)
    }

    const USER_LAT = 0;
    const USER_LONG = 1;
    const USER_TIME = 2;

    const { _id } = jwt.verify(token, secret);
    const currentUser = await User.findById(_id, SELECT.ALL);
    const allUsers = await User.find({ _id: { "$ne": _id } }, SELECT.ALL);
    let nearbyPlayers = [];

    const earthRadius = 6371e3;
    const currentUserLatInRadians = toRadians(Number(currentUser.geo.split("|", 1)[0]));
    allUsers.forEach(user => {
      if (user.geo) {
        let nearbyUserLatInRadians = toRadians(Number(user.geo.split("|")[USER_LAT]));
        let summationLat = toRadians((user.geo.split("|")[USER_LAT] - currentUser.geo.split("|")[USER_LAT]));
        let summationLong = toRadians((user.geo.split("|")[USER_LONG] - currentUser.geo.split("|")[USER_LONG]));
        let a = Math.sin(summationLat / 2) * Math.sin(summationLat / 2) +
          Math.cos(currentUserLatInRadians) * Math.cos(nearbyUserLatInRadians) *
          Math.sin(summationLong / 2) * Math.sin(summationLong / 2);
        let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        let distance = earthRadius * c;
        if (distance <= 5) {
          nearbyPlayers.push(user);
        }
      }

    })

    return nearbyPlayers;
  },
  getLogByID: async (root, { _id }, ctx) => Log.findById(_id, SELECT.LOG.BASIC),
  getLogs: async (root, args, ctx) => Log.find(args || {}, SELECT.LOG.ALL),
}