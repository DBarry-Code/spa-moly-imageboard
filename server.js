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
    updateProfile,
    updateUser,
} = require("./db");

const { requireLoggedUser, requireSignature } = require("./middlewares");

const path = require("path");
const cookieSession = require("cookie-session");
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

// hidde Key: for deploy!
let SESSION_SECRET;

if (process.env.NODE_ENV == "production") {
    SESSION_SECRET = process.env.SESSION_SECRET;
} else {
    SESSION_SECRET = require("./secrets.json").SESSION_SECRET;
}

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
        secret: `${SESSION_SECRET}`,
        maxAge: 1000 * 60 * 60 * 24 * 14,
        sameSite: true,
    })
);

//Get root
app.get("/", requireLoggedUser, (req, res) => {
    if (req.session.user_id) {
        res.redirect("/petition");
    }
});

// Get petition
app.get("/petition", requireLoggedUser, (req, res) => {
    const { user_id } = req.session;

    getSignatureById(user_id).then((signature) => {
        if (signature) {
            res.redirect("/thank-you");
        }
        res.render("index", {
            text: "Please sign to my 'NO PINEAPPLE ON PIZZA' movement",
        });
    });
});

//POST from petion
app.post("/petition", requireLoggedUser, (req, res) => {
    const user_id = req.session.user_id;

    createSignatures(req.body, user_id)
        .then(() => {
            res.redirect("/thank-you");
        })
        .catch((error) => {
            console.log("[Post error]", error);
            res.sendStatus(500);
        });
});

//Get thank you page
app.get("/thank-you", requireLoggedUser, requireSignature, (req, res) => {
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

//get profile
app.get("/profile", requireLoggedUser, (req, res) => {
    res.render("profile", {
        text: "Now please tell us just a little bit more.",
    });
});

app.post("/profile", requireLoggedUser, (req, res) => {
    const { age, city, homepage } = req.body;
    const user_id = req.session.user_id;

    createProfile(req.body, user_id)
        .then((profile) => {
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

        req.session.user_id = foundUser[0].id;
        res.redirect("/thank-you");
    });
});

app.get("/profile/edit", requireLoggedUser, (req, res) => {
    const { user_id } = req.session;

    getUserProfil(user_id).then((profile) => {
        res.render("edit", {
            text: "Edit your profile",
            ...profile,
        });
    });
});

app.post("/profile/edit", requireLoggedUser, (req, res) => {
    const { user_id } = req.session;

    Promise.all([
        updateProfile(user_id, {
            ...req.body,
        }),
        updateUser(user_id, { ...req.body }),
    ])
        .then(() => {
            res.redirect("/profile/edit");
        })
        .catch((error) => {
            console.log("POST - /profile/edit error", error);
            getUserProfil(user_id).then((profile) => {
                res.render("edit", {
                    text: "Edit your profile",
                    ...profile,
                    error: "Check your Input",
                });
            });
        });
});

// all singner page only with link
app.get("/signatures", requireLoggedUser, requireSignature, (req, res) => {
    getSignatures()
        .then((signatures) => {
            res.render("signatures", {
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

app.post("/unsign", requireLoggedUser, requireSignature, (req, res) => {
    const { user_id } = req.session;

    deleteSiganture(user_id)
        .then(() => {
            res.redirect("/petition");
        })
        .catch((error) => {
            console.log("ungsig error", error);
            res.sendStatus(500);
        });
});

app.get(
    "/signatures/:city",
    requireLoggedUser,
    requireSignature,
    (req, res) => {
        const { city } = req.params;

        getSignatureByCity(city)
            .then((signatures) => {
                res.render("signatureCity", {
                    text: `There are ${signatures.length} sigeners from ${city}`,
                    signatures,
                    city,
                });
            })
            .catch((error) => {
                console.log("[GET City]", error);
            });
    }
);

app.post("/logout", requireLoggedUser, (req, res) => {
    req.session.user_id = null;
    return res.redirect("/");
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
