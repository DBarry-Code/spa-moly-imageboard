const { checkLogin } = require("../db");
const { requireLoggedUser } = require("../middlewares");
const { passwordCheck } = require("../checks");
const { express, Router } = require("express");
const cookieSession = require("cookie-session");

const router = Router();

router.use(
    cookieSession({
        secret: `I'm always angry.`,
        maxAge: 1000 * 60 * 60 * 24 * 14,
        sameSite: true,
    })
);

// get from login
router.get("/login", (req, res) => {
    res.render("login", {
        text: "Please Log-In",
    });
});

// post from login
router.post("/login", (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.render("login", {
            text: "Please Log-In",
            error: "Please fill out all fields",
        });
    }

    if (passwordCheck(password) === true) {
        checkLogin({ email, password }).then((foundUser) => {
            if (!foundUser) {
                return res.render("login", {
                    text: "Please Log-In",
                    error: "WRONG INPUT",
                });
            }

            req.session.user_id = foundUser[0].id;
            res.redirect("/thank-you");
            return;
        });
    } else {
        return res.render("login", {
            text: "Please Log-In",
            error: "Nice try... try it again!",
        });
    }
});

//POST logout
router.post("/logout", requireLoggedUser, (req, res) => {
    // req.session.user_id = null;
    res.clearCookie("session.sig", { path: "/" });
    res.clearCookie("session", { path: "/" });
    return res.redirect("/login");
});

module.exports = router;
