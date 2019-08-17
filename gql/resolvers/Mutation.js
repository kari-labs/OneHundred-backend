const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');

const mongoose = require('mongoose');
mongoose.connect('mongodb://35.222.204.58:27017/jam', { useNewUrlParser: true });

const User = require('../../schemas/User');
const Base = require('../../schemas/Base');
const Log = require('../../schemas/Log');

const saltRounds = 10;
const secret = "nicoleIsACutie";

const SELECT = {
  ALL: '_id name username email xp coins base created lastLogin',
  ALL_INSECURE: '_id name username password email xp coins base',
  BASIC: '_id name username email',
  BASE: {
    ALL: '_id data owner geo',
    BASIC: '_id data geo',
  }
};

module.exports = {
  login: async (root, { username, password, geo }, ctx, info) => {
    let attemptedUser = await User.findOne({ username }, '_id name username email xp coins base password lastLogin');
    let passwordMatch = await bcrypt.compare(password, attemptedUser.password);
    if (passwordMatch) {
      delete attemptedUser._doc.password;
      if (geo) {
        await User.updateOne({ _id: attemptedUser._id.toString() }, { geo });
      }
      // let user = await User.findById(attemptedUser._id, SELECT.ALL);
      //attemptedUser.updateTime();
      let token = jwt.sign(attemptedUser.toJSON(), secret);
      return token;
    }
    else throw "Incorrect username or password";
  },
  logout: async (root, { jwt: token }, ctx) => {
    let user = jwt.verify(token, secret);
    if (user) {
      await User.updateOne({ _id: attemptedUser._id.toString() }, { geo });
      return true;
    }
    else throw "Error: Invalid JWT"
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
      let update = await User.updateOne({ username }, { $inc: { xp: amount } });
      if (update) return true;
      else return false;
    }
    else return false;
  },
  removeXP: async (root, { jwt: token, amount }, ctx) => {
    let { username } = jwt.verify(token, secret);
    if (username) {
      let update = await User.updateOne({ username }, { $inc: { xp: -amount } });
      if (update) return true;
      else return false;
    }
    else return false;
  },
  addCoins: async (root, { jwt: token, amount }, ctx) => {
    let { username } = jwt.verify(token, secret);
    if (username) {
      let update = await User.updateOne({ username }, { $inc: { coins: amount } });
      if (update) return true;
      else return false;
    }
    else throw "Error: JWT Invalid";
  },
  removeCoins: async (root, { jwt: token, amount }, ctx) => {
    let { username } = jwt.verify(token, secret);
    if (username) {
      let update = await User.updateOne({ username }, { $inc: { coins: -amount } });
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
      await User.updateOne({ _id }, { base: saving._id })
      return true;
    }
    else throw "Error: JWT Invalid";
  },
  updateBase: async (root, { jwt: token, data, geo }, ctx) => {
    let { _id: owner } = jwt.verify(token, secret);
    if (owner) {
      let base = await Base.updateOne({ owner }, (geo ? { data, geo } : { data }));
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
  updateGeo: async (root, { jwt: token, geo }, ctx) => {
    let { _id } = jwt.verify(token, secret);
    if (_id) {
      await User.updateOne({ _id }, { geo });
      return true;
    } else throw "Error: Invalid JWT"
  },
  createLog: async (root, { jwt: token, attacker, attackee, win, duration }, ctx) => {
    let user = jwt.verify(token, secret);
    if (user) {
      let log = new Log({
        attacker,
        attackee,
        win,
        duration,
      });
      await log.save();
      return true;
    } else throw "Error: Invalid JWT"
  },
};