// Lnkdto.link - Copyright (C) 2021 Moritz Kaufmann
// Main Requests

// Import Express
import * as express from "express";

// Import Password-Hashing
import * as hashing from "password-hash";

// Import Utils
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

router.get("/user/short", (req, res) => {
    res.render("container", getContainerParameters(req, true, "short"));
});

router.get("/user/edituser", (req, res) => {
    res.render("container", getContainerParameters(req, true, "edituser"));
});

router.get("/user/domainList", (req, res) => {
    res.render("container", getContainerParameters(req, true, "domainList"));
});

router.get("/passwordCheck/:domain/:label", (req, res) => {
    res.render("views/passwordCheck", getContainerParameters(req, true, "domainList"));
});

router.post("/passwordCheck/:domain/:label", async (req, res) => {
    if (await UrlHelper.Urls.urlExists(req.params["label"], req.params["domain"])) {
        const url:UrlHelper.Url = await UrlHelper.Urls.getUrl(req.params["label"], req.params["domain"]);
        if (hashing.verify(req.body["password"], url.password))
            res.redirect("/api/url/" + req.params["domain"] + "/" + req.params["label"] + "/click");
        else
            res.redirect("/passwordCheck/" + req.params["domain"] + "/" + req.params["label"]);
    } else {
        res.redirect("/");
    }
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
        content: await UrlHelper.Urls.getUrlsFromUser(SessionHandler.getStorage(req)["username"]),
        isLoggedIn: typeof SessionHandler.getStorage(req)["username"] !== 'undefined'
    });
});

module.exports = router;
