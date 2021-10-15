const {
    createSignatures,
    getSignatures,
    getSignatureById,
    getSignatureCount,
} = require("./db");

const path = require("path");
//const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");
const express = require("express");
const app = express();
const port = 3000;

//handlebars setup
const hb = require("express-handlebars");
app.engine("handlebars", hb());
app.set("view engine", "handlebars");

// Middlewears
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(
    cookieSession({
        secret: `I'm always angry.`,
        maxAge: 1000 * 60 * 60 * 24 * 14,
    })
);

// Get hompage
app.get("/", (req, res) => {
    if (req.session.signature_id) {
        res.redirect("/thank-you");
        return;
    }
    res.render("index", {
        text: "Please sign",
    });
});

//POST from hompage
app.post("/", (req, res) => {
    const { first_name, last_name, signature } = req.body;

    createSignatures({ first_name, last_name, signature })
        .then(({ id }) => {
            req.session.signatureId = id;
            console.log("erste id", id);
            res.redirect("/thank-you");
        })
        .catch((error) => {
            console.log("[Post error]", error);
            res.sendStatus(500);
        });
});

//Get thank you page
app.get("/thank-you", (req, res) => {
    const id = req.session.signatureId;
    console.log("zweite id", id);
    if (!id) {
        res.redirect("/");
        return;
    }

    Promise.all([getSignatureById(id), getSignatureCount()])
        .then(([signature, headcount]) => {
            console.log(headcount, signature);
            res.render("thank-you", {
                text: "Thanks for signing",
                signature,
                headcount,
            });
        })
        .catch((error) => {
            console.log("can't get signatures", error);
            res.sendStatus(500);
        });

    // getSignatures()
    //     .then((signatures) => {
    //         res.render("thank-you", {
    //             text: "Thanks for signing",
    //             headcount: signatures.length,
    //         });
    //     })
    //     .catch((error) => {
    //         console.log("can't get signatures", error);
    //         res.statusCode(500);
    //     });
});

// all singner page only with link
app.get("/signatures", (req, res) => {
    getSignatures()
        .then((signatures) => {
            res.render("signatures", {
                text: "Thats all:",
                signatures,
                headcount: `${signatures.length} signers all ready`,
            });
            //console.log(signatures);
        })
        .catch((error) => {
            console.log("can't get signatures", error);
            res.statusCode(500);
        });
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
