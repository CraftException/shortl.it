/*
*  lnkdto-link2 ©2021
*  Developer: CraftException
*
*  LICENSE: MIT
*/

import {generateRandomString} from "./NumberGenerator";
import {CookieAPI} from "./SessionManager";
import * as fs from "fs";

export module LanguageManager {

    loagLanguages();
    const LANGUAGE_COOKIE_KEY:string = "LANG";
    const DEFAULT_LANG:string = "en";

    export const languages:object[] = []

    export function initializeLang(req, res):void {
        // Create a session, if it doesn't exists
        if (!CookieAPI.cookieExists(req, LANGUAGE_COOKIE_KEY))
            CookieAPI.setCookie(res, LANGUAGE_COOKIE_KEY, DEFAULT_LANG)
    }

    export function getLanguage(lang:string):object {
        if (!languages[lang])
            loagLanguages();

        if (!languages[lang])
            return;
        else
            return languages[lang];
    }

    export function getFallbackLanguage(originalLang:string):object {
        return languages[getLanguage(originalLang)["details"]["fallback"]];
    }

    export function getAllLanguages() {
        if (!languages[DEFAULT_LANG])
            loagLanguages();

        return Object.keys(languages);
    }

    export function getLanguagesLongCodes() {
        var languageLongCodes:string[] = [];
        getAllLanguages().forEach(lang => {
            languageLongCodes.push(getLanguage(lang)["names"]["long"]);
        });
        return languageLongCodes;
    }

    export function getLanguageCode(req):string {
        return CookieAPI.getCookies(req, LANGUAGE_COOKIE_KEY);
    }

    export function loagLanguages():void {
        fs.readdir("lang", function (err, files) {
            files.forEach((file) => {
                const lang = file.split(".")[0];
                languages[lang] = JSON.parse(fs.readFileSync("lang/" + file, "utf-8"));
            });
        });
    }

}