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

function getSignaturesIdBYUserID(id) {
    return db
        .query("SELECT id FROM signatures WHERE user_id = $1", [id])
        .then((result) => result.rows[0]);
}

function getSignatures() {
    return db
        .query(
            `SELECT users.first_name, users.last_name,
            user_profiles.age,
            user_profiles.city,
            user_profiles.homepage
            FROM users
            FULL JOIN user_profiles
            ON users.id = user_profiles.user_id
            JOIN signatures
            ON users.id = signatures.user_id;`
        )
        .then((result) => result.rows);
}

function getSignatureByCity(city) {
    //console.log(city);
    return db
        .query(
            `SELECT users.first_name, users.last_name,
            user_profiles.age,
            user_profiles.city,
            user_profiles.homepage
            FROM users
            FULL JOIN user_profiles
            ON users.id = user_profiles.user_id
            JOIN signatures
            ON users.id = signatures.user_id
            WHERE user_profiles.city ILIKE $1`,
            [city]
        )
        .then((result) => result.rows);
}

function getUserProfil(id) {
    return db
        .query(
            `SELECT
            users.first_name,
            users.last_name,
            users.email,
            user_profiles.age,
            user_profiles.city,
            user_profiles.homepage
            FROM
            users
            FULL JOIN user_profiles ON users.id = user_profiles.user_id
            WHERE
            user_id = $1;`,
            [id]
        )
        .then((result) => result.rows[0]);
}

function getSignatureCount() {
    return db
        .query("SELECT COUNT(id) FROM signatures")
        .then((result) => result.rows[0].count);
}

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

function createProfile({ age, city, homepage }, user_id) {
    //console.log(user_id);
    return db
        .query(
            `INSERT INTO user_profiles(user_id, age, city, homepage) VALUES($1, $2, $3, $4) RETURNING *`,
            [user_id, +age, city, homepage]
        )
        .then((result) => result.rows[0]);
}

function getUserByEmail(email) {
    //console.log(email);
    return db
        .query(`SELECT * FROM users WHERE email = $1`, [email])
        .then((result) => result.rows);
}

function getUserByID(userID) {
    //console.log(userID);
    return db
        .query(`SELECT * FROM users WHERE id = $1`, [userID])
        .then((result) => result.rows);
}

function deleteSiganture(id) {
    return db
        .query(`DELETE FROM signatures WHERE signatures.user_id = $1`, [id])
        .then((result) => result.rows);
}

function updateProfile(user_id, { age, city, homepage }) {
    console.log(user_id);
    return db
        .query(
            `INSERT INTO user_profiles (user_id, age, city, homepage)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (user_id)
            DO UPDATE SET age = $2, city = $3, homepage = $4`,
            [user_id, age ? age : null, city, homepage]
        )
        .then((result) => result.rows[0]);
}

function updateUser(user_id, { first_name, last_name, email, password }) {
    if (!password || password == "" || password == undefined) {
        return db.query(
            `UPDATE users
            SET first_name = $2, last_name = $3, email = $4
            WHERE id = $1`,
            [user_id, first_name, last_name, email]
        );
    } else
        return hash(password).then((hashedPassword) => {
            return db.query(
                `UPDATE users
            SET first_name = $2, last_name = $3, email = $4, password = $5
            WHERE id = $1`,
                [user_id, first_name, last_name, email, hashedPassword]
            );
        });
}

//! node problems: can't make a modul "node --trace-warnings"

function checkLogin({ email, password }) {
    //console.log(email, password);
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
    checkLogin,
    getUserByID,
    createProfile,
    getSignatureByCity,
    getUserProfil,
    deleteSiganture,
    updateProfile,
    getSignaturesIdBYUserID,
    updateUser,
};
