// Lnkdto.link - Copyright (C) 2021 Moritz Kaufmann
// A simple url shortener, with login system, stats and co.

// Import express webserver
import * as express from "express";

// Import path for static servers
import * as path from "path";

// Import Cookie-Parser
import * as coookieparser from "cookie-parser";

// Import API-Router
import {router as ApiRouter} from "./backend/ApiHandler";
import * as mainRouter from "./router/Main";
import * as viewRouter from "./router/Views";
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
app.use("/api", ApiRouter); //@ts-ignore
app.use(mainRouter); //@ts-ignore
app.use(viewRouter);

// Setup express static files
app.use("/assets", express.static(path.resolve(`${__dirname}/static`)));

// Redirect to specific long url
app.get("*", async (req, res) => {
    if (await UrlHelper.Urls.urlExists(req.url.substring(1), req.get('host'))) {
        const url:UrlHelper.Url = await UrlHelper.Urls.getUrl(req.url.substring(1), req.get('host'));
        if (url.password)
            res.redirect("/passwordCheck/" + req.get('host') + "/" + req.url.substring(1));
        else
            res.redirect("/api/url/" + req.get('host') + "/" + req.url.substring(1) + "/click");
    } else {
        res.redirect("/");
    }
});

// Export of the app for the bootstrap file
module.exports = app;
