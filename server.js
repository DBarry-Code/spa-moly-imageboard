const { createSignatures, getSignatures } = require("./db");
const path = require("path");
const cookieParser = require("cookie-parser");
const express = require("express");
const app = express();
const port = 3000;

//handlebars setup
const hb = require("express-handlebars");
const { response } = require("express");
app.engine("handlebars", hb());
app.set("view engine", "handlebars");

// Middlewears
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Get hompage
app.get("/", (req, res) => {
    if (req.cookies.signed) {
        res.redirect("/thank-you");
        return;
    }
    res.render("index", {
        text: "Please sign",
    });
});

app.post("/", (req, res) => {
    const { first_name, last_name, signature } = req.body;

    createSignatures({ first_name, last_name, signature })
        .then(() => {
            res.cookie("signed", true);
            res.redirect("/thank-you");
        })
        .catch((error) => {
            console.log("[Post error]", error);
            res.sendStatus(500);
        });
});

app.get("/thank-you", (req, res) => {
    if (!req.cookies.signed) {
        res.redirect("/");
        return;
    }
    getSignatures()
        .then((signatures) => {
            res.render("thank-you", {
                text: "Thanks for signing",
                headcount: signatures.length,
            });
        })
        .catch((error) => {
            console.log("can't get signatures", error);
            res.statusCode(500);
        });
});

app.get("/signatures", (req, res) => {
    getSignatures()
        .then((signatures) => {
            res.render("signatures", {
                text: "Thats all :",
                signatures,
                headcount: `${signatures.length} signers all ready`,
            });
        })
        .catch((error) => {
            console.log("can't get signatures", error);
            res.statusCode(500);
        });
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
