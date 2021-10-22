const {
    createProfile,
    getUserProfil,
    updateProfile,
    updateUser,
} = require("../db");

const { requireLoggedUser } = require("../middlewares");

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

router.get("/profile", requireLoggedUser, (req, res) => {
    res.render("profile", {
        text: "Now please tell us just a little bit more.",
    });
});

router.post("/profile", requireLoggedUser, (req, res) => {
    const { age, city, homepage } = req.body;
    const user_id = req.session.user_id;

    createProfile(req.body, user_id)
        .then((profile) => {
            return res.redirect("/");
        })
        .catch((error) => {
            console.log("[POST profile]", error);
        });
});

router.get("/profile/edit", requireLoggedUser, (req, res) => {
    const { user_id } = req.session;

    getUserProfil(user_id).then((profile) => {
        return res.render("edit", {
            text: "Edit your profile",
            ...profile,
        });
    });
});

router.post("/profile/edit", requireLoggedUser, (req, res) => {
    const { user_id } = req.session;

    Promise.all([
        updateProfile(user_id, {
            ...req.body,
        }),
        updateUser(user_id, { ...req.body }),
    ])
        .then(() => {
            return res.redirect("/profile/edit");
        })
        .catch((error) => {
            console.log("POST - /profile/edit error", error);
            getUserProfil(user_id).then((profile) => {
                return res.render("edit", {
                    text: "Edit your profile",
                    ...profile,
                    error: "Check your Input",
                });
            });
        });
});

module.exports = router;
