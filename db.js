const spicedPg = require("spiced-pg");
const bcrypt = require("bcryptjs");

const { db_user, db_key, db_name } = require("./secrets.json");

const db = spicedPg(`postgres:${db_user}:${db_key}@localhost:5432/${db_name}`);

function createSignatures({ signature }, user_id) {
    return db
        .query(
            `INSERT INTO signatures (signature, user_id)
        VALUES($1,$2)
        RETURNING *`,
            [signature, user_id]
        )
        .then((result) => result.rows[0]);
}

function getSignatures() {
    return db.query("SELECT * FROM signatures").then((result) => result.rows);
}

function getSignatureCount() {
    return db
        .query("SELECT COUNT(id) FROM signatures")
        .then((result) => result.rows[0].count);
}
/*
function getSignatureById(id) {
    return db
        .query("SELECT * FROM signatures WHERE id = $1", [id])
        .then((result) => result.rows[0]);
}
*/
function getSignatureById(id) {
    return db
        .query("SELECT * FROM signatures WHERE user_id = $1", [id])
        .then((result) => result.rows[0]);
}

function createUser({ first_name, last_name, email, password }) {
    return hash(password).then((password_hash) => {
        return db
            .query(
                `INSERT INTO users (first_name, last_name, email, password_hash) VALUES($1, $2, $3, $4)
            RETURNING *`,
                [first_name, last_name, email, password_hash]
            )
            .then((result) => result.rows[0]);
    });
}

function getUsers(email) {
    //console.log(email);
    return db
        .query("SELECT * FROM users WEHRE email = $1", [email])
        .then((result) => result.rows[0]);
}

function getUserByEmail(email) {
    //console.log(email);
    return db
        .query(`SELECT * FROM users WHERE email = $1`, [email])
        .then((result) => result.rows);
}

//! node problems: can't make a modul "node --trace-warnings"

function checkLogin({ email, password }) {
    return getUserByEmail(email).then((foundUser) => {
        //console.log(foundUser[0].password_hash);

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

module.exports = {
    createSignatures,
    getSignatures,
    getSignatureById,
    getSignatureCount,
    createUser,
    getUsers,
    checkLogin,
};
