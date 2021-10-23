const { createUser } = require("../db");
const { passwordCheck, checkEmail } = require("../checks");
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

//get register
router.get("/register", (req, res) => {
    res.render("register", {
        text: "Please Register to use the site",
    });
});

// post from register
router.post("/register", (req, res) => {
    const { first_name, last_name, email, password } = req.body;

    if (!first_name || !last_name || !email || !password) {
        return res.render("register", {
            text: "Please fill all inputs",
            error: "WRONG INPUT",
        });
    }
    if (passwordCheck(password) === true && checkEmail(email) === true) {
        createUser(req.body)
            .then(({ id }) => {
                req.session.user_id = id;
                return res.redirect("/profile");
            })
            .catch((error) => {
                console.log("[register]", error);
                if (error.constraint === "users_email_key") {
                    res.status(400);
                    return res.render("register", {
                        error: "Email already in use",
                    });
                }
            });
    } else {
        return res.render("register", {
            text: "Please Log-In",
            error: "Nice try... try it again!",
        });
    }
});

module.exports = router;
