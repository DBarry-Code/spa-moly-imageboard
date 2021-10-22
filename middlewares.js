const { getSignatureById } = require("./db");

function requireLoggedUser(req, res, next) {
    // if the user is not logged, redirect to /login
    // else move forward!
    if (!req.session.user_id) {
        res.redirect("/register");
        return;
    }
    next();
}

function requireSignature(req, res, next) {
    // if the user has not signe yet, redirect to the page where they can sign
    // else move forward!
    //
    // remember: middlewares can contain async operations.
    getSignatureById(req.session.user_id).then((signature) => {
        if (signature) {
            next();
            return;
        }
        return res.redirect("/");
    });
}

module.exports = {
    requireLoggedUser,
    requireSignature,
};
