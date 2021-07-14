// Lnkdto.link - Copyright (C) 2021 Moritz Kaufmann
// Handle all View Requests

// Import Express
import * as express from "express";
import {SessionHandler} from "../backend/SessionManager";
import {UrlHelper} from "../backend/DatabaseManager";

// Import Version
const {version} = require("../package.json");

// Get Router
const router = express.Router();

router.get("/view/start", (req, res) => {
    res.render("views/start", {});
})

router.get("/view/stats", (req, res) => {
    res.render("views/stats", {});
})

router.get("/view/usercontrol", async (req, res) => {
    if (typeof SessionHandler.getStorage(req)["username"] !== 'undefined')
        res.render("views/usercontrol", {content: await UrlHelper.getUrlsFromUser(SessionHandler.getStorage(req)["username"])});
    else
        res.end("You are not logged in");
})

router.get("/view/edituser", (req, res) => {
    if (typeof SessionHandler.getStorage(req)["username"] !== 'undefined')
        res.render("views/edituser", {});
    else
        res.end("You are not logged in");
})

module.exports = router;