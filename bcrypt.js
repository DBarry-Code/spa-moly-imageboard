const bcrypt = require("bcryptjs");

const hash = (password) =>
    bcrypt.genSalt().then((salt) => bcrypt.hash(password, salt));
const compare = bcrypt.compare;

module.exports = { hash, compare };
