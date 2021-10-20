const {
    createUser,
    createSignatures,
    getSignatures,
    getSignatureById,
    getSignatureCount,
    checkLogin,
    getUserByID,
    createProfile,
    getSignatureByCity,
    getUserProfil,
    deleteSiganture,
} = require("./db");

const path = require("path");
const cookieSession = require("cookie-session");
const express = require("express");
const app = express();
const port = 3000;

//handlebars setup
const hb = require("express-handlebars");
const { error } = require("console");
const res = require("express/lib/response");
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
    } else if (!req.session.signatureID || req.session.signatureID === 0) {
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

    if (!id) {
        res.redirect("/");
        return;
    }

    Promise.all([
        getSignatureById(userID),
        getSignatureCount(),
        getUserByID(userID),
    ])
        .then(([signature, headcount, user]) => {
            //console.log(headcount, signature, user);
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

//get register
app.get("/register", (req, res) => {
    res.render("register", {
        text: "Please Register to use the site",
    });
});

// post from register
app.post("/register", (req, res) => {
    const { first_name, last_name, email, password } = req.body;

    if (!first_name || !last_name || !email || !password) {
        return res.render("register", {
            text: "Please fill all inputs",
            err: "WRONG INPUT",
        });
    }

    createUser(req.body)
        .then(({ id }) => {
            req.session.userID = id;
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

//get profile
app.get("/profile", (req, res) => {
    const { userID } = req.session;

    if (!userID) {
        res.redirect("/");
        return;
    }

    res.render("profile", {
        text: "Now please tell us just a little bit more.",
    });
});

app.post("/profile", (req, res) => {
    const { age, city, homepage } = req.body;
    const userID = req.session.userID;
    console.log(userID);

    createProfile(req.body, userID)
        .then((profile) => {
            console.log(profile);
            res.redirect("/");
        })
        .catch((error) => {
            console.log("[POST profile]", error);
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

app.get("/profile/edit", (req, res) => {
    const { userID } = req.session;

    if (!userID) {
        res.redirect("/");
        return;
    }

    getUserProfil(userID).then((profile) => {
        //console.log(profile);
        res.render("edit", {
            text: "Edit your profile",
            ...profile,
        });
    });
});

// all singner page only with link
app.get("/signatures", (req, res) => {
    const { signatureID } = req.session;

    if (!signatureID) {
        res.redirect("/");
        return;
    }

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

app.post("/unsign", (req, res) => {
    const { userID } = req.session;

    deleteSiganture(userID)
        .then(() => {
            req.session.signatureID = 0;
            res.redirect("/petition");
        })
        .catch((error) => {
            console.log("ungsig error", error);
            res.sendStatus(500);
        });
});

app.get("/signatures/:city", (req, res) => {
    const { city } = req.params;
    const { signatureID } = req.session;

    if (!signatureID) {
        res.redirect("/");
        return;
    }

    getSignatureByCity(city)
        .then((signatures) => {
            res.render("signatureCity", {
                text: `There are ${signatures.length} sigeners from ${city}`,
                signatures,
                city,
            });
            //console.log(signatures);
        })
        .catch((error) => {
            console.log("[GET City]", error);
        });
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
