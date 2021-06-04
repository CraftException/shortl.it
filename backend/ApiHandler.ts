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
import {sendRecoveryMail} from "./mailHelper";

// Get Router
const router = express.Router();

// API-Information
router.get("/api", (req, res) => {
    SessionHandler.initializeSession(req, res);
    res.json({
        version: version
    });
});

// Get stats
router.get("/api/stats", (req, res) => {
    SessionHandler.initializeSession(req, res);

    // Calculate Clicks
    var clicks = 0;
    DatabaseHelper.selectData(database, "urls", {}, {}).forEach(data => clicks += data.clicks);

    // Calculate mostClicks
    var mostClicks = 0;
    DatabaseHelper.selectData(database, "urls", {}, {}).forEach(data => {
        if (data.clicks > mostClicks)
            mostClicks = data.clicks
    });

    res.json({
        message: "OK",
        shortenUrls: DatabaseHelper.selectData(database, "urls", {}, {}).length,
        users: DatabaseHelper.selectData(database, "User", {}, {}).length,
        clicks: clicks,
        mostClicks: mostClicks
    })
});

// Login Handler
router.post("/api/login", (req, res) => {
    SessionHandler.initializeSession(req, res);

    // Get Information
    const username = <string>req.body["username"];
    const password = <string>req.body["password"];

    // Return, if the user is already logged in
    if (SessionHandler.getStorage(req)["username"] !== undefined) {
        res.json({
            message: "Already logged in",
            username: SessionHandler.getStorage(req)["username"]
        });
        return;
    }

    // Check if the user exists
    if (!UserHelper.usernameExists(username)) {
        res.json({
            message: "User does not exists"
        });
        return;
    }

    // Check if the password is correct
    const user:User = UserHelper.getAccount(username);
    if (!hashing.verify(password, user.password)) {
        // The password is wrong
        res.json({
            message: "Wrong Password"
        });
        return;
    } else {
        // The Password is correct
        SessionHandler.setSessionValue(req, "username", username);
        res.json({
            message: "OK"
        });
    }
});

// Check if the user is logged in
router.get("/api/isLoggedIn", (req, res) => {
    SessionHandler.initializeSession(req, res);

    if (typeof SessionHandler.getStorage(req)["username"] !== 'undefined') {
        // The User is logged in
        res.json({
            message: "Already logged in",
            username: SessionHandler.getStorage(req)["username"]
        });
    } else {
        // The user isn't logged in
        res.json({
            message: "Not logged in",
        });
    }
    console.log(req.cookies)
});

// Register a new account
router.post("/api/register", (req, res) => {
    SessionHandler.initializeSession(req, res);

    // Get information
    const username = <string>req.body["username"];
    const password = <string>req.body["password"];
    const email = <string>req.body["email"];

    // Fallback if the user is already logged in
    if (SessionHandler.getStorage(req)["username"] !== undefined) {
        res.json({
            message: "Already logged in",
            username: SessionHandler.getStorage(req)["username"]
        });
    } else {
        // Check if the user already exists
        if (UserHelper.usernameExists(username) || UserHelper.mailExists(email) || username === "___") {
            res.json({
                message: "Already exists"
            });
            return;
        }

        // Create the account
        UserHelper.createAccount({
            password: hashing.generate(password),
            mail: email,
            displayname: username
        });

        // Log in to the account
        SessionHandler.setSessionValue(req, "username", username);
        res.json({
            message: "OK"
        });
    }
});

// Get the short url
router.post("/api/getShortUrl", (req, res) => {
    SessionHandler.initializeSession(req, res);

    const longURL = req.body["longUrl"];
    res.json({
       message: "OK",
       shortUrl: UrlHelper.generateUrl(longURL, typeof SessionHandler.getStorage(req)["username"] !== 'undefined' ? SessionHandler.getStorage(req)["username"] : "___")
    });
});

// Get the long url
router.post("/api/getLongUrl", (req, res) => {
    SessionHandler.initializeSession(req, res);

    // Get information
    const shortUrl = req.body["shortUrl"];
    const countHits = req.body["countHits"];

    // Check if the url exists
    if (!(UrlHelper.urlExists(shortUrl))) {
        // The url does not exists
        res.json({
            message: "URL not exists"
        });
    } else {
        // Return long url
        res.json({
            message: "OK",
            longUrl: UrlHelper.getLongUrl(shortUrl, countHits)
        });
    }
});

// Get the information about a short url
router.post("/api/urlInfo", (req, res) => {
    SessionHandler.initializeSession(req, res);

    // Get information
    const shortUrl = req.body["shortUrl"];

    // Check if the url exists
    if (!(UrlHelper.urlExists(shortUrl))) {
        // The url does not exists
        res.json({
            message: "URL not exists"
        });
    } else {
        // Check if the user ahs access to an url
        if (UrlHelper.hasUserAccessToUrl(shortUrl, SessionHandler.getStorage(req)["username"])) {
            res.json({
                message: "OK",
                data: UrlHelper.getUrlData(shortUrl)
            });
        } else {
            // The user does not have access to this url
            res.json({
                message: "Access forbidden",
            });
        }
    }
});

// Delete an Url
router.post("/api/deleteUrl", (req, res) => {
    SessionHandler.initializeSession(req, res);

    // Get information
    const shortUrl = req.body["shortUrl"];

    // Check if the url exists
    if (!(UrlHelper.urlExists(shortUrl))) {
        // The url does not exists
        res.json({
            message: "URL not exists"
        });
    } else {
        // Check if the user ahs access to an url
        if (UrlHelper.hasUserAccessToUrl(shortUrl, SessionHandler.getStorage(req)["username"])) {
            // Delete the Url
            UrlHelper.deleteUrl(shortUrl);

            res.json({
                message: "OK"
            });
        } else {
            // The user does not have access to this url
            res.json({
                message: "Access forbidden",
            });
        }
    }
});

// Get all urls from an user
router.post("/api/getUserUrls", (req, res) => {
    SessionHandler.initializeSession(req, res);

    // Check if the user is logged in
    if (typeof SessionHandler.getStorage(req)["username"] !== 'undefined') {
        // Return urls
        res.json({
            message: "OK",
            data: UrlHelper.getUrlsFromUser(SessionHandler.getSessionID(req))
        });
    } else {
        // The user isn't logged in
        res.json({
            message: "Not logged in"
        });
    }
});

// Check if a user has access to an url
router.post("/api/hasUserAccessToUrl", (req, res) => {
    SessionHandler.initializeSession(req, res);

    // The user does not have access to an url
    const shortUrl = req.body["shortUrl"];

    // Check if the user is logged in
    if (typeof SessionHandler.getStorage(req)["username"] !== 'undefined') {
        // Return if the user has access to this url
        res.json({
            message: "OK",
            data: UrlHelper.hasUserAccessToUrl(shortUrl, SessionHandler.getStorage(req)["username"])
        });
    } else {
        // The user is not logged in
        res.json({
            message: "Not logged in"
        });
    }
});

// Change a user account
router.post("/api/changeData", (req, res) => {
    SessionHandler.initializeSession(req, res);

    // The new userdata
    const newMailData = req.body["mail"];
    const newPasswordData = req.body["password"];

    // Check if the user is logged in
    if (typeof SessionHandler.getStorage(req)["username"] !== 'undefined') {
        // Check if the mail has to been changed
        if (typeof newMailData !== 'undefined') {
            UserHelper.updateMail(SessionHandler.getStorage(req)["username"], newMailData);

            // Return that the mail has been changed
            res.json({
                message: "OK"
            });
        }

        // Check if the password has to been changed
        if (typeof newPasswordData !== 'undefined') {
            UserHelper.updatePassword(SessionHandler.getStorage(req)["username"], hashing.generate(newPasswordData));

            // Return if the password has been changed
            res.json({
                message: "OK"
            });
        }

    } else {
        // The user is not logged in
        res.json({
            message: "Not logged in"
        });
    }
});

// Request a password change
router.post("/api/requestPasswordChange", (req, res) => {
    if (!(typeof SessionHandler.getStorage(req)["username"] !== 'undefined')) {
        // Get recovery mail
        const username = req.body["username"];

        // Check if the provided mail does exists
        if (UserHelper.usernameExists(username)) {
            // Get the username
            const mail = UserHelper.getAccount(username).mail;

            // Generate a token
            const token = RecoveryHelper.createToken(mail);

            // Send the mail
            sendRecoveryMail(mail, {
                username: username,
                link: "https://lnkdto.link/resetPassword?token=" + token
            })

            res.json({
                message: "OK"
            });
        } else {
            // The mail does not exists
            res.json({
                message: "The mail does not exists"
            });
        }
    } else {
        // The user is already logged in
        res.json({
            message: "The user is already logged in!"
        });
    }
});

// Logout
router.post("/api/logout", (req, res) => {
    // Delete username
    SessionHandler.getStorage(req)["username"] = undefined;

    res.json({
        message: "OK"
    });
});

module.exports = router;