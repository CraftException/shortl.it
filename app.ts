// Lnkdto.link - Copyright (C) 2021 Moritz Kaufmann
// A simple url shortener, with login system, stats and co.

// Import express webserver
import * as express from "express";

// Import path for static servers
import * as path from "path";

// Import Cookie-Parser
import * as coookieparser from "cookie-parser";

// Import API-Router
import * as apiRouter from "./backend/ApiHandler";
import {UrlHelper} from "./backend/DatabaseManager";

// Add express instance
var app = express();

// Setup view Engine
app.set('views', path.join(__dirname, 'layout'));
app.set('view engine', 'ejs');

// Setup express details
app.use(coookieparser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Import API Router
// @ts-ignore
app.use(apiRouter);

// Setup express static files
app.use("/static", express.static(path.resolve(`${__dirname}/static`)));

app.get("/api", (req, res) => {
    res.json({ message: "Hello from server!" });
    res.end();
})

app.use('*', (req, res) => {
    console.log(req.originalUrl.substring(1))
    if (UrlHelper.urlExists(req.originalUrl.substring(1))) {
        res.redirect(<string>UrlHelper.getLongUrl(req.originalUrl.substring(1), true));
        return;
    }
    res.sendFile(path.resolve(__dirname, './view', 'container.html'));
});

// Export of the app for the bootstrap file
module.exports = app;