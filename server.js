const {
    createUser,
    createSignatures,
    getSignatures,
    getSignatureById,
    getSignatureCount,
    checkLogin,
} = require("./db");

const path = require("path");
const cookieSession = require("cookie-session");
const express = require("express");
const app = express();
const port = 3000;

//handlebars setup
const hb = require("express-handlebars");
const { error } = require("console");
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

//Get root
app.get("/", (req, res) => {
    res.redirect("/petition");
});

// Get petition
app.get("/petition", (req, res) => {
    if (req.session.signatureID) {
        res.redirect("/thank-you");
        return;
    } else if (!req.session.userID) {
        res.redirect("/register");
        return;
    } else {
        res.render("index", {
            text: "Please sign to my 'NO PINEAPPLE ON PIZZA' movement",
        });
    }
});

//POST from petion
app.post("/petition", (req, res) => {
    const { signature } = req.body;
    const userID = req.session.userID;
    //console.log(userID);
    //console.log(signature);

    createSignatures(req.body, userID)
        .then(({ id }) => {
            req.session.signatureID = id;
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
    const id = req.session.signatureID;
    const userID = req.session.userID;
    console.log(userID);
    console.log(id);
    //console.log("zweite id", id);
    if (!id) {
        res.redirect("/");
        return;
    }
    // TODO: getuserByID to see first and last name
    Promise.all([getSignatureById(userID), getSignatureCount()])
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

//get register
app.get("/register", (req, res) => {
    res.render("register", {
        text: "Please Register to use the site",
    });
});

// post from register
app.post("/register", (req, res) => {
    const { first_name, last_name, email, password } = req.body;
    //console.log(req.body);
    //TODO: FORM VALIDATION!

    createUser(req.body)
        .then(({ id }) => {
            req.session.userID = id;
            res.redirect("/");
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

// get from login
app.get("/login", (req, res) => {
    res.render("login", {
        text: "Please Log-In",
    });
});

// post from login
app.post("/login", (req, res) => {
    const { email, password } = req.body;
    console.log(email, password);
    if (!email || !password) {
        return res.render("login", {
            title: "login",
            err: "Please fill out all fields",
        });
    }
    checkLogin({ email, password }).then((foundUser) => {
        if (!foundUser) {
            return res.render("login", {
                title: "login",
                err: "WRONG INPUT",
            });
        }
        //store user_id in session and redirect
        req.session.userID = foundUser[0].id;
        res.redirect("/");
    });
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
