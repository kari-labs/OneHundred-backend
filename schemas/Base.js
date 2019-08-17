const mongoose = require('mongoose');

const baseSchema = new mongoose.Schema({
    data: String,
    owner: mongoose.Types.ObjectId,
    geo: String,
});

const Base = mongoose.model('Base', baseSchema);

module.exports = Base;