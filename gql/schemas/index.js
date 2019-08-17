const fs = require('fs');
require.extensions['.gql'] = function (module, filename) {
    module.exports = fs.readFileSync(filename).toString();
};
const query = require('./query.gql');
const mutation = require('./mutation.gql');
const user = require('./user.gql');
const base = require('./base.gql');
const log = require('./log.gql');

module.exports = [ query, mutation, user, base, log ];