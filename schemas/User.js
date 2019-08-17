const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        first: String,
        last: String,
    },
    username: String,
    password: String,
    email: String,
    xp: {
        type: Number,
        default: 0,
    },
    coins: {
        type: Number,
        default: 0,
    },
    base: mongoose.Types.ObjectId,
    geo: String,
    lastLogin: Date,
});

userSchema.virtual('created').get( function () {
    return this["_created"] = (new Date(this._id.getTimestamp())).toISOString();
});
userSchema.pre('update', function() {
    this.update({}, { $set: { lastLogin: new Date() } });
});

const User = mongoose.model('User', userSchema);

module.exports = User;