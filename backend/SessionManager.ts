// Lnkdto.link - Copyright (C) 2021 Moritz Kaufmann
// Session Manager

// Import Cookie Parser
import * as coookieparser from "cookie-parser";
import {generateRandomString} from "./NumberGenerator";
import {LanguageManager} from "./LanguageManager";

// The Session Storage, while the Server is running
var storage:object = {};

// Session Controller, to save Session variables
export module SessionHandler {

    // The Key of the Cookie with the session id
    const SESSION_COOKIE_KEY:string = "SESSION_ID";

    // Initialize a session, once a request is made
    export function initializeSession(req, res):void {
        // Create a session, if it doesn't exists
        if (!CookieAPI.cookieExists(req, SESSION_COOKIE_KEY))
            CookieAPI.setCookie(res, SESSION_COOKIE_KEY, generateRandomString(15))

        // Save an empty storage, if the storage is undefined
        if (!storage[CookieAPI.getCookies(req, SESSION_COOKIE_KEY)])
            storage[CookieAPI.getCookies(req, SESSION_COOKIE_KEY)] = {};
    }

    // Get Session-ID
    export function getSessionID(req):string {
        return CookieAPI.getCookies(req, SESSION_COOKIE_KEY);
    }

    // Get a storage
    export function getStorage(req):object {
        if (!storage[CookieAPI.getCookies(req, SESSION_COOKIE_KEY)])
            return {};
        else
            return storage[CookieAPI.getCookies(req, SESSION_COOKIE_KEY)]
    }

    // Set the value of a storage
    export function setSessionValue(req, key, value):object {
        if (!storage[CookieAPI.getCookies(req, SESSION_COOKIE_KEY)])
            return;

        storage[CookieAPI.getCookies(req, SESSION_COOKIE_KEY)][key] = value;
        return storage[CookieAPI.getCookies(req, SESSION_COOKIE_KEY)];
    }

}

// API for Cookie Handling
export module CookieAPI {

    // Set a cookie
    export function setCookie (res, key:string, value:string) {
        res.cookie(key, value, { maxAge: 90000000000, httpOnly: true });
    }

    // Does a cookie exists?
    export function cookieExists(req, key:string):boolean {
        const value = req.cookies[key]
        return !(value == null || value == undefined || value == "" || typeof value === 'undefined')
    }

    // Get a cookie
    export function getCookies(req, key:string):string {
        return req.cookies[key];
    }

}