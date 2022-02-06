// Lnkdto.link - Copyright (C) 2021 Moritz Kaufmann
// Handle all API Requests

// Import Express
import * as express from "express";

// Import Session-Manager
import {SessionHandler} from "./SessionManager";
import {database, DatabaseHelper, RecoveryHelper, UrlHelper, UserHelper} from "./DatabaseManager";
import User = UserHelper.User;

// Import Version
const {version} = require("../package.json");

// Import Password Hashing
import * as hashing from "password-hash";

// Import Utils
import {sendRecoveryMail} from "./mailHelper";
import {LanguageManager} from "./LanguageManager";
import {generateRandomString} from "./NumberGenerator";

// Get Router
export const router = express.Router();

router.all("*", (req, res, next) => {
    SessionHandler.initializeSession(req, res);
    next();
});

// API-Information
router.get("/", (req, res) => {
    res.json({
        version: version
    });
});

// Get stats
router.get("/stats", async (req, res) => {
    // Calculate Clicks
    var clicks = 0;
    (await DatabaseHelper.selectData(database, "urls", {}, {})).forEach(data => clicks += data.statistics.totalClicks);

    // Calculate mostClicks
    var mostClicks = 0;
    (await DatabaseHelper.selectData(database, "urls", {}, {})).forEach(data => {
        if (data.statistics.totalClicks > mostClicks)
            mostClicks = data.statistics.totalClicks
    });

    // @ts-ignore
    res.json({
        message: "Ok",
        shortenUrls: (await DatabaseHelper.selectData(database, "urls", {}, {})).length,
        users: (await DatabaseHelper.selectData(database, "User", {}, {})).length,
        clicks: clicks,
        mostClicks: mostClicks
    })
});

// Login Handler
router.post("/session/:username", async (req, res) => {
    // Get Information
    const username = <string>req.params["username"];
    const password = <string>req.body["password"];

    // Check if the user exists
    if (!(await UserHelper.usernameExists(username))) {
        res.json({
            message: "User does not exists"
        });
        return;
    }

    const user:User = await UserHelper.getAccount(username);
    if (SessionHandler.getStorage(req)["username"] === undefined) {
        // Check if the password is correct
        if (hashing.verify(password, user.password)) {
            SessionHandler.setSessionValue(req, "username", username);
            res.json({
                message: "Ok",
            });
            return;
        } else {
            // The password is wrong
            res.json({
                message: "Wrong Password"
            });
            return;
        }
    } else {
        res.json({
            message: "Already Authorized"
        });
    }
});

router.get("/session", async (req, res) => {
    if (SessionHandler.getStorage(req)["username"] === undefined) {
        res.json({
            message: "Not authorized",
        });
        return;
    }
    res.redirect("/user/" + SessionHandler.getStorage(req)["username"]);
});

// Logout
router.delete("/session", (req, res) => {
    // Delete username
    SessionHandler.getStorage(req)["username"] = undefined;

    res.json({
        message: "Ok"
    });
});

// Login Handler
router.get("/user/:user", async (req, res) => {
    // Get Information
    const username = <string>req.params["username"];

    // Check if the user exists
    if (!(await UserHelper.usernameExists(username))) {
        res.json({
            message: "User does not exists"
        });
        return;
    }

    const user:User = await UserHelper.getAccount(username);
    if (SessionHandler.getStorage(req)["username"] === undefined) {
        res.json({
            message: "Not authorized",
        });
    }

    // Return, if the user is already logged in
    if (SessionHandler.getStorage(req)["username"] !== undefined) {
        if (SessionHandler.getStorage(req)["username"] === username || user.permissionLevel === "Administrator") {
            res.json({
                message: "Ok",
                username: user.displayname,
                mail: user.mail,
                profilePicture: user.profilePicture,
                createdAt: user.createdAt
            });
        } else {
            res.json({
                message: "Not authorized",
            });
        }
        return;
    }
});

// Update the language
router.get("/lang/:lang", (req, res) => {
    const lang = req.params["lang"].toString();

    // Check if the language exists
    if (LanguageManager.languageExists(lang)) {
        // Update the language and return to the source URL
        LanguageManager.updateLanguage(res, lang);
        if (req.query["then"])
            res.redirect(req.query["then"].toString());
        else
            res.json(LanguageManager.getLanguage(lang));
    } else {
        res.json({
            message: "Language not found"
        });
    }
});

const reservedUsernames = ["new", "Admin", "Administrator", "___"];

// Register a new account
router.post("/user/new", async (req, res) => {
    // Get information
    const user:User = JSON.parse(req.body["user"]);

    // Fallback if the user is already logged in
    if (SessionHandler.getStorage(req)["username"] !== undefined) {
        res.json({
            message: "Already authorized",
            username: SessionHandler.getStorage(req)["username"]
        });
    } else {
        // Check if the user already exists
        if (await UserHelper.usernameExists(user.displayname) || reservedUsernames.includes(user.displayname)) {
            res.json({
                message: "Username not allowed"
            });
            return;
        }

        // Create the account
        user.permissionLevel = "Default";
        user.password = hashing.generate(user.password);
        await UserHelper.createAccount(user);

        // Log in to the account
        SessionHandler.setSessionValue(req, "username", user.displayname);
        res.json({
            message: "Ok"
        });
    }
});

// Update a account
router.post("/user/:user", async (req, res) => {
    // Get Information
    const username = req.params["username"] == "current" ? <string>req.params["username"] : SessionHandler.getStorage(req)["username"];

    // Check if the user exists
    if (!(await UserHelper.usernameExists(username))) {
        res.json({
            message: "User does not exists"
        });
        return;
    }

    const oldUser:User = await UserHelper.getAccount(username);
    if (SessionHandler.getStorage(req)["username"] === undefined) {
        res.json({
            message: "Not authorized",
        });
    }

    // Return, if the user is already logged in
    if (SessionHandler.getStorage(req)["username"] !== undefined) {
        if (SessionHandler.getStorage(req)["username"] === username || oldUser.permissionLevel === "Administrator") {
            const newUser:User = {
                displayname: req.body["displayname"] || oldUser.displayname,
                mail: req.body["mail"] || oldUser.mail,
                password: req.body["password"] ? hashing.generate(req.body["password"]) : oldUser.password,
                profilePicture: req.body["profilePicture"] || oldUser.profilePicture,
                permissionLevel: oldUser.permissionLevel === "Administrator" ? req.body["permissionLevel"] : oldUser.permissionLevel,
                createdAt: oldUser.createdAt
            };
            UserHelper.updateUser(oldUser.displayname, newUser);

            res.json({
                message: "Ok"
            });
        } else {
            res.json({
                message: "Not authorized",
            });
        }
        return;
    } else {
        res.json({
            message: "Already authorized",
        });
    }
});

// Update a account
router.delete("/user/:user", async (req, res) => {
    // Get Information
    const username = <string>req.params["username"];

    // Check if the user exists
    if (!(await UserHelper.usernameExists(username))) {
        res.json({
            message: "User does not exists"
        });
        return;
    }

    const user:User = await UserHelper.getAccount(username);
    if (SessionHandler.getStorage(req)["username"] === undefined) {
        res.json({
            message: "Not authorized",
        });
    }

    // Return, if the user is already logged in
    if (SessionHandler.getStorage(req)["username"] !== undefined) {
        if (SessionHandler.getStorage(req)["username"] === username || user.permissionLevel === "Administrator") {
            UserHelper.deleteUser(username);
            SessionHandler.deleteAllWithUsername(username);

            res.json({
                message: "Ok"
            });
        } else {
            res.json({
                message: "Not authorized",
            });
        }
        return;
    }
});

// Request a password change
router.post("/user/:user/requestRecovery", async (req, res) => {
    // Get Information
    const username = <string>req.params["user"];

    // Check if the user exists
    if (!(await UserHelper.usernameExists(username))) {
        res.json({
            message: "User does not exists"
        });
        return;
    }

    const user:User = await UserHelper.getAccount(username);

    // Return, if the user is already logged in
    if (SessionHandler.getStorage(req)["username"] === undefined) {
        // Get the username
        const mail = user.mail;

        // Generate a token
        const token = await RecoveryHelper.createToken(mail);

        // Send the mail
        sendRecoveryMail(mail, {
            username: username,
            link: "https://lnkdto.link/resetPassword?token=" + token
        })

        res.json({
            message: "Ok"
        });
        return;
    } else {
        res.json({
            message: "Already authorized",
        });
    }
});


router.post("/url", async (req, res) => {
    const label = generateRandomString(6);
    var url: UrlHelper.Url = null;
    if (typeof SessionHandler.getStorage(req)["username"] !== 'undefined') {
        url = {
            target: req.body["target"],
            domain: req.body["domain"] || req.get('host'),
            label: req.body["label"] || label,
            access: [],
            password: req.body["password"] != "" && req.body["password"] ? hashing.generate(req.body["password"]) : null,
            creator: typeof SessionHandler.getStorage(req)["username"] !== 'undefined' ? SessionHandler.getStorage(req)["username"] : "___",
            statistics: {
                clicks: {},
                totalClicks: 0,
                operationSystem: {android: 0, ios: 0, windows: 0, macos: 0, linux: 0, other: 0},
                platforms: {desktop: 0, mobile: 0, other: 0}
            }
        };
    } else {
        url = {
            target: req.body["target"],
            domain: req.get('host'),
            label: label,
            access: [],
            password: null,
            creator: "___",
            statistics: {
                clicks: {},
                totalClicks: 0,
                operationSystem: {android: 0, ios: 0, windows: 0, macos: 0, linux: 0, other: 0},
                platforms: {desktop: 0, mobile: 0, other: 0}
            }
        };
    }

    await UrlHelper.Urls.generateUrl(url);

    res.json({
        message: "Ok",
        domain: url.domain,
        label: label
    });
});

router.get("/url/:domain/:label", async (req, res) => {
    const label = req.params["label"];
    const domain = req.params["domain"];

    if (!(await UrlHelper.Urls.urlExists(label, domain))) {
        res.json({
            message: "Url does not exist"
        });
        return;
    }

    const url:UrlHelper.Url = await UrlHelper.Urls.getUrl(label, domain) || null;
    if (!url) {
        res.json({
            message: "An error occurred"
        });
        return;
    }

    if (!(url.password && hashing.verify(req.get["Authorization"], url.password))) {
        res.json({
            message: "Wrong password"
        });
        return;
    }

    if (typeof SessionHandler.getStorage(req)["username"] !== 'undefined' ? url.creator === SessionHandler.getStorage(req)["username"] || url.access.includes(SessionHandler.getStorage(req)["username"]): url.creator === "___") {
        res.json({
            message: "Ok",
            ...url
        });
    } else {
        res.json({
            message: "Not authorized"
        });
        return;
    }

});

function getOperationSystem(req) {
    var osName = "other";
    if (!!req.headers['user-agent'].match(/Windows/)) osName = "windows";
    if (!!req.headers['user-agent'].match(/macOS/)) osName = "macos";
    if (!!req.headers['user-agent'].match(/Linux/)) osName = "linux";
    if (!!req.headers['user-agent'].match(/Android/)) osName = "android";
    if (!!req.headers['user-agent'].match(/iPad|iPhone/)) osName = "ios";

    return osName;
}

function getPlatform(req) {
    var platform = "other";
    if(getOperationSystem(req).match(/windows|mac|linux/)) platform = "desktop";
    if(getOperationSystem(req).match(/android|ios/)) platform = "desktop";

    return platform;
}

router.get("/url/:domain/:label/click", async (req, res) => {
    const label = req.params["label"];
    const domain = req.params["domain"];

    if (!(await UrlHelper.Urls.urlExists(label, domain))) {
        res.json({
            message: "Url does not exist"
        });
        return;
    }

    const url:UrlHelper.Url = await UrlHelper.Urls.getUrl(label, domain) || null;
    if (!url) {
        res.json({
            message: "An error occurred"
        });
        return;
    }

    url.statistics.totalClicks += 1;
    const currentDate = new Date().toLocaleDateString("de-DE");
    if (!url.statistics.clicks[currentDate]) {
        url.statistics.clicks[currentDate] = 1;
    } else {
        url.statistics.clicks[currentDate] += 1;
    }
    url.statistics.operationSystem[getOperationSystem(req)] += 1;
    url.statistics.platforms[getPlatform(req)] += 1;

    await UrlHelper.Urls.updateUrl(label, domain, url);
    res.redirect(url.target);
});

router.delete("/url/:domain/:label", async (req, res) => {
    const label = req.params["label"];
    const domain = req.params["domain"];

    if (!(await UrlHelper.Urls.urlExists(label, domain))) {
        res.json({
            message: "Url does not exist"
        });
        return;
    }

    const url:UrlHelper.Url = await UrlHelper.Urls.getUrl(label, domain) || null;
    if (!url) {
        res.json({
            message: "An error occurred"
        });
        return;
    }

    if (typeof SessionHandler.getStorage(req)["username"] !== 'undefined' ? url.creator === SessionHandler.getStorage(req)["username"] || url.access.includes(SessionHandler.getStorage(req)["username"]): url.creator === "___") {
        await UrlHelper.Urls.deleteUrl(label, domain);
        res.json({
            message: "Ok"
        });
    } else {
        res.json({
            message: "Not authorized"
        });
        return;
    }
});
