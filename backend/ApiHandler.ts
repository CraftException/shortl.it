// Lnkdto.link - Copyright (C) 2021 Moritz Kaufmann
// Handle all API Requests

// Import Express
import * as express from "express";

// Import Session-Manager
import {SessionHandler} from "./SessionManager";
import {DatabaseHelper, UrlHelper, UserHelper} from "./DatabaseManager";
import User = UserHelper.User;

// Import Version
const {version} = require("../package.json");

// Import Password Hashing
import * as hashing from "password-hash";
import getUrlData = UrlHelper.getUrlData;

// Get Router
const router = express.Router();

// API-Information
router.get("/api", (req, res) => {
    SessionHandler.initializeSession(req, res);
    res.json({
        version: version
    });
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
router.post("/api/isLoggedIn", (req, res) => {
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
            message: "Not logged in"
        });
    }
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
        if (UserHelper.usernameExists(username) || UserHelper.mailExists(email)) {
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
       shortUrl: UrlHelper.generateUrl(longURL, SessionHandler.getSessionID(req))
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
        if (UrlHelper.hasUserAccessToUrl(shortUrl, SessionHandler.getSessionID(req))) {
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
            data: UrlHelper.hasUserAccessToUrl(shortUrl, SessionHandler.getSessionID(req))
        });
    } else {
        // The user is not logged in
        res.json({
            message: "Not logged in"
        });
    }
});

module.exports = router;