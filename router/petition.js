const {
    getSignatureById,
    createSignatures,
    getSignatureCount,
    getUserByID,
} = require("../db");
const { requireLoggedUser, requireSignature } = require("../middlewares");
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

router.get("/petition", requireLoggedUser, (req, res) => {
    const { user_id } = req.session;

    getSignatureById(user_id).then((signature) => {
        if (signature) {
            res.redirect("/thank-you");
            return;
        }
        res.render("index", {
            text: "Please sign to my 'NO PINEAPPLE ON PIZZA' movement",
        });
    });
});

//POST from petion
router.post("/petition", requireLoggedUser, (req, res) => {
    const user_id = req.session.user_id;

    createSignatures(req.body, user_id)
        .then(() => {
            res.redirect("/thank-you");
            return;
        })
        .catch((error) => {
            console.log("[Post error]", error);
            res.sendStatus(500);
        });
});

//Get thank you page
router.get("/thank-you", requireLoggedUser, requireSignature, (req, res) => {
    const user_id = req.session.user_id;

    Promise.all([
        getSignatureById(user_id),
        getSignatureCount(),
        getUserByID(user_id),
    ])
        .then(([signature, headcount, user]) => {
            res.render("thank-you", {
                text: "thanks for signing, now you are a",
                signature,
                headcount,
                user: user[0],
            });
        })
        .catch((error) => {
            console.log("can't get signatures", error);
            res.sendStatus(500);
        });
});

module.exports = router;
