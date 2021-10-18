const {
    createSignatures,
    getSignatures,
    getSignatureById,
    getSignatureCount,
} = require("./db");

const path = require("path");
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
        sameSite: true,
    })
);

//Get fotm root

app.get("/", (req, res) => {
    res.redirect("/petition");
});

// Get hompage
app.get("/petition", (req, res) => {
    if (req.session.signatureId) {
        res.redirect("/thank-you");
        return;
    } else if (!req.session.userId) {
        res.redirect("/register");
        return;
    } else {
        res.render("index", {
            text: "Please sign to my 'NO PINEAPPLE ON PIZZA' movement",
        });
    }
});

//POST from hompage
app.post("/petition", (req, res) => {
    const { first_name, last_name, signature } = req.body;
    //console.log(first_name, last_name, signature);

    createSignatures({ first_name, last_name, signature })
        .then(({ id }) => {
            req.session.signatureId = id;
            //console.log("erste id", id);
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
    //console.log("zweite id", id);
    if (!id) {
        res.redirect("/");
        return;
    }

    Promise.all([getSignatureById(id), getSignatureCount()])
        .then(([signature, headcount]) => {
            //console.log(headcount, signature);
            res.render("thank-you", {
                text: "thanks for signing, now you are a",
                signature,
                headcount,
            });
        })
        .catch((error) => {
            console.log("can't get signatures", error);
            res.sendStatus(500);
        });
});

app.get("/register", (req, res) => {
    res.render("register", {
        text: "Please Register to use the site",
    });
});

app.post("/register", (req, res) => {
    const { first_name, last_name, email, password } = req.body;
    console.log(first_name, last_name, email, password);
});

app.get("/login", (req, res) => {
    res.render("login", {
        text: "Pleas Log-In",
    });
});

app.post("/login", (req, res) => {
    const { email, password } = req.body;
    console.log(email, password);
});

// all singner page only with link
app.get("/signatures", (req, res) => {
    getSignatures()
        .then((signatures) => {
            res.render("signatures", {
                text: "All singers:",
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
