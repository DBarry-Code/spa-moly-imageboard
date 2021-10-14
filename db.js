const spicedPg = require("spiced-pg");
const { db_user, db_key, db_name } = require("./secrets.json");

const db = spicedPg(`postgres:${db_user}:${db_key}@localhost:5432/${db_name}`);

function createSignatures({ first_name, last_name, signature }) {
    return db
        .query(
            `INSERT INTO signatures (first_name, last_name, signature)
        VALUES($1, $2, $3)
        RETURNING *`,
            [first_name, last_name, signature]
        )
        .then((result) => result.rows[0]);
}

function getSignatures() {
    return db.query("SELECT * FROM signatures").then((result) => result.rows);
}

module.exports = {
    createSignatures,
    getSignatures,
};
