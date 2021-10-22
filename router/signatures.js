const { getSignatures, getSignatureByCity, deleteSiganture } = require("../db");
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

router.get("/signatures", requireLoggedUser, requireSignature, (req, res) => {
    getSignatures()
        .then((signatures) => {
            return res.render("signatures", {
                text: "All singers:",
                signatures,
                headcount: `${signatures.length} signers all ready`,
            });
        })
        .catch((error) => {
            console.log("can't get signatures", error);
            res.statusCode(500);
        });
});

router.get(
    "/signatures/:city",
    requireLoggedUser,
    requireSignature,
    (req, res) => {
        const { city } = req.params;

        getSignatureByCity(city)
            .then((signatures) => {
                return res.render("signatureCity", {
                    text: `There are ${signatures.length} sigeners from`,
                    signatures,
                    city,
                });
            })
            .catch((error) => {
                console.log("[GET City]", error);
            });
    }
);

router.post("/unsign", requireLoggedUser, requireSignature, (req, res) => {
    const { user_id } = req.session;

    deleteSiganture(user_id)
        .then(() => {
            return res.redirect("/petition");
        })
        .catch((error) => {
            console.log("ungsig error", error);
            res.sendStatus(500);
        });
});

module.exports = router;
