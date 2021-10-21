const { createUser } = require("../db");

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

    createUser(req.body)
        .then(({ id }) => {
            req.session.user_id = id;
            res.redirect("/profile");
        })
        .catch((error) => {
            console.log("[register]", error);
            if (error === "users_email_key") {
                res.statusCode(400);
                //TODO: Show error user!
                res.send("Email already in use");
            }
        });
});

module.exports = router;
