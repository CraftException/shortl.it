// Lnkdto.link - Copyright (C) 2021 Moritz Kaufmann
// Language Manager

import {generateRandomString} from "./NumberGenerator";
import {CookieAPI} from "./SessionManager";
import * as fs from "fs";

export module LanguageManager {

    loagLanguages();
    const LANGUAGE_COOKIE_KEY:string = "LANG";
    export const DEFAULT_LANG:string = "en";

    export const languages:object[] = []

    export function initializeLang(req, res):void {
        // Create a session, if it doesn't exists
        if (!CookieAPI.cookieExists(req, LANGUAGE_COOKIE_KEY))
            CookieAPI.setCookie(res, LANGUAGE_COOKIE_KEY, DEFAULT_LANG)
    }

    export function updateLanguage(res, lang):void {
        CookieAPI.setCookie(res, LANGUAGE_COOKIE_KEY, lang);
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

    export function languageExists(language:string):boolean {
        return languages[language] != undefined;
    }

    export function getLanguagesCodes() {
        var languageLongCodes:object[] = [];
        getAllLanguages().forEach(lang => {
            languageLongCodes.push({
                names: getLanguage(lang)["names"],
                code: getLanguage(lang)["details"]["lang"]
            });
        });
        return languageLongCodes;
    }

    export function getLanguageCode(req):string {
        return CookieAPI.getCookies(req, LANGUAGE_COOKIE_KEY) || "en";
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