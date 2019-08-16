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
    created: {
        type: String,
        default: Date.now().toLocaleString()
    },
});

const User = mongoose.model('User', userSchema);

module.exports = User;