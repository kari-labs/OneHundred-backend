const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
    attacker: mongoose.Types.ObjectId,
    attackee: mongoose.Types.ObjectId,
    win: Boolean,
    duration: Number,
});

logSchema.virtual('created').get( function () {
    return this["_created"] = (new Date(this._id.getTimestamp())).toISOString();
});

const Log = mongoose.model('Log', logSchema);

module.exports = Log;