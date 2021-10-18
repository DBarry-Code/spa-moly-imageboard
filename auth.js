const { getUserByEmail } = require("./db.js");
const bcrypt = require("bcryptjs");

function checkLogin({ email, password }) {
    return getUserByEmail(email).then((foundUser) => {
        console.log(foundUser[0].password_hash);

        if (!foundUser) {
            return null;
        }
        return bcrypt
            .compare(password, foundUser[0].password_hash)
            .then((match) => {
                if (match) {
                    return foundUser;
                }
                return null;
            });
    });
}

function hash(password) {
    return bcrypt.genSalt().then((salt) => {
        return bcrypt.hash(password, salt);
    });
}

//module.exports = { checkLogin, hash };
