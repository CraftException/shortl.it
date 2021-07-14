// Lnkdto.link - Copyright (C) 2021 Moritz Kaufmann
// Main Requests

// Import Express
import * as express from "express";
import {SessionHandler} from "../backend/SessionManager";
import {UrlHelper} from "../backend/DatabaseManager";
import {LanguageManager} from "../backend/LanguageManager";

// Import Version
const {version} = require("../package.json");

// Get Router
const router = express.Router();

router.get("*", (req, res, next) => {
    LanguageManager.initializeLang(req, res);

    if (!LanguageManager.languageExists(LanguageManager.getLanguageCode(req))) {
        LanguageManager.updateLanguage(res, LanguageManager.DEFAULT_LANG);
    }
    next();
});

router.get("/", (req, res) => {
    res.render("container", getContainerParameters(req, true, "start"));
});

router.get("/stats", (req, res) => {
    res.render("container", getContainerParameters(req, false, "stats"));
});

router.get("/user/edituser", (req, res) => {
    res.render("container", getContainerParameters(req, true, "edituser"));
});

router.get("/user/usercontrol", (req, res) => {
    res.render("container", getContainerParameters(req, true, "usercontrol"));
});

function getContainerParameters(req, navbarWithForm:boolean, view:string) {
    return {
        navbarWithForm: true,
        isLoggedIn: typeof SessionHandler.getStorage(req)["username"] !== 'undefined',

        selectedLangShortCode: LanguageManager.getLanguage(LanguageManager.getLanguageCode(req))["names"]["short"],
        availableLangs: LanguageManager.getLanguagesCodes(),
        selectedLang: LanguageManager.getLanguage(LanguageManager.getLanguageCode(req)),
        fallback: LanguageManager.getFallbackLanguage(LanguageManager.getLanguageCode(req)),

        view:view
    };
}

router.get("/extension", async (req, res) => {
    res.render("extension", {
        content: await UrlHelper.getUrlsFromUser(SessionHandler.getStorage(req)["username"]),
        isLoggedIn: typeof SessionHandler.getStorage(req)["username"] !== 'undefined'
    });
});

module.exports = router;