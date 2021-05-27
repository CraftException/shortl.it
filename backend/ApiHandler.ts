// Lnkdto.link - Copyright (C) 2021 Moritz Kaufmann
// Handle all API Requests

// Import Express
import * as express from "express";

// Import Session-Manager
import {SessionHandler} from "./SessionManager";
import {UserHelper} from "./DatabaseManager";
import User = UserHelper.User;

// Import Version
const {version} = require("../package.json");

// Import Password Hashing
import * as hashing from "password-hash";

// Get Router
const router = express.Router();

router.get("/api", (req, res) => {
    SessionHandler.initializeSession(req, res);
    res.json({
        version: version
    });
});

router.get("/api/login", (req, res) => {
    SessionHandler.initializeSession(req, res);

    const username = <string>req.query["username"];
    const password = <string>req.query["password"];

    if (SessionHandler.getStorage(req)["username"] !== undefined) {
        res.json({
            message: "Already logged in",
            username: SessionHandler.getStorage(req)["username"]
        });
        return;
    }

    if (!UserHelper.usernameExists(username)) {
        res.json({
            message: "User does not exists"
        });
        return;
    }

    const user:User = UserHelper.getAccount(username);
    if (!hashing.verify(password, user.password)) {
        res.json({
            message: "Wrong Password"
        });
        return;
    } else {
        SessionHandler.setSessionValue(req, "username", username);
        res.json({
            message: "OK"
        });
    }
});

router.get("/api/isLoggedIn", (req, res) => {
    SessionHandler.initializeSession(req, res);

    if (typeof SessionHandler.getStorage(req)["username"] !== 'undefined') {
        res.json({
            message: "Already logged in",
            username: SessionHandler.getStorage(req)["username"]
        });
    } else {
        res.json({
            message: "Not logged in"
        });
    }
});

router.get("/api/register", (req, res) => {
    SessionHandler.initializeSession(req, res);

    const username = <string>req.query["username"];
    const password = <string>req.query["password"];
    const email = <string>req.query["email"];

    if (SessionHandler.getStorage(req)["username"] !== undefined) {
        res.json({
            message: "Already logged in",
            username: SessionHandler.getStorage(req)["username"]
        });
    } else {
        if (UserHelper.usernameExists(username) || UserHelper.mailExists(email)) {
            res.json({
                message: "Already exists"
            });
            return;
        }

        UserHelper.createAccount({
            password: hashing.generate(password),
            mail: email,
            displayname: username
        });

        SessionHandler.setSessionValue(req, "username", username);
        res.json({
            message: "OK"
        });
    }
});

module.exports = router;