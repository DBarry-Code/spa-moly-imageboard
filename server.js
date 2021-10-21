//server setup
const { requireLoggedUser } = require("./middlewares");
const path = require("path");
const cookieSession = require("cookie-session");
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

//express Router
const login = require("./router/login");
const register = require("./router/register");
const petition = require("./router/petition");
const profile = require("./router/profile");
const signatures = require("./router/signatures");

//handlebars setup
const hb = require("express-handlebars");
app.engine("handlebars", hb());
app.set("view engine", "handlebars");
const hbs = hb.create({});
hbs.handlebars.registerHelper("allLowerCase", (value) => value.toLowerCase());
hbs.handlebars.registerHelper("capitalizeFirst", (value) =>
    value ? `${value[0].toUpperCase()}${value.slice(1).toLowerCase()}` : ""
);

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

app.use(login, register, profile, signatures, petition);

//Get root
app.get("/", requireLoggedUser, (req, res) => {
    if (req.session.user_id) {
        res.redirect("/petition");
    }
});

app.get("/favicon.ico", (req, res) => {
    res.status(204);
    return response.end();
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
