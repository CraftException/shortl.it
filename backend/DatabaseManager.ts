// Lnkdto.link - Copyright (C) 2021 Moritz Kaufmann
// Database Manager

// Import File System
import * as fs from "fs";

// Import MongoDB
import * as mongodb from "mongodb";

// Import DeASync
import {generateRandomString} from "./NumberGenerator";

// The MongoDB File
const mongouri = fs.readFileSync("backend/mongouri.txt", "utf-8");

// MongoDB Details
export const database = "test";

// API for User Management
export module UserHelper {

    // User Model
    export interface User {
        displayname:string,
        mail:string,
        profilePicture:string,
        createdAt:Date,

        password:string,
        permissionLevel:"Administrator"|"Premium"|"Default"
    }

    // Check if a username Exists
    export async function usernameExists(displayname:string):Promise<boolean> {
        var result = await DatabaseHelper.selectData(database, "User", {displayname:displayname}, {})
        return result.length > 0
    }

    // Get an account
    export async function getAccount(name):Promise<User> {
        return (await DatabaseHelper.selectData(database, "User", {displayname:name}, {}))[0]
    }

    // Create an Account
    export function createAccount(user:User) {
        DatabaseHelper.insertData(database, "User", user)
    }

    // Update Password
    export function updateUser(displayName:string, newUser:User) {
        DatabaseHelper.updateData(database, "User", {displayname:displayName}, {$set:newUser})
    }

    // Delete an Account
    export function deleteUser(displayName:string) {
        DatabaseHelper.deleteData(database, "User", {displayName:displayName});
    }

}

// API for URL Management
export module UrlHelper {
    // Shorten-URL Model
    export interface Url {
        target:string,
        label:string,
        domain: string
        statistics:UrlStatistics,
        creator:string,
        access:string[],
        password:string|null
    }

    // Url Statistic Model
    export interface UrlStatistics {
        clicks:[],
        totalClicks:number,
        operationSystem:{
            "windows": number,
            "macos": number,
            "linux": number,
            "android": number,
            "ios": number,
            "other": number
        }
        "platforms": {
            "desktop": number,
            "mobile": number,
            "other": number
        }
    }

    export module Codes {

        export async function getCode(target:string):Promise<string> {
            var code = (await DatabaseHelper.selectData(database, "codes", {target: target}, {}))[0];
            if (!code)
                await DatabaseHelper.insertData(database, "codes", {
                    target: target,
                    code: generateRandomString(6)
                });

            return code.code;
        }

        export async function codeExists(target:string):Promise<boolean> {
            return (await DatabaseHelper.selectData(database, "codes", {target: target}, {}))[0];
        }

        export async function getTarget(code:string):Promise<string> {
            var target = (await DatabaseHelper.selectData(database, "codes", {code: code}, {}))[0];
            if (!target)
                return "?"

            return target.target;
        }

    }

    export module Urls {

        export async function getUrl(label:string, domain:string|null):Promise<Url | false> {
            if (!(await urlExists(label, domain)))
                return false;

            return (await DatabaseHelper.selectData(database, "urls", {label: label, domain: domain}, {}))[0];
        }

        export async function generateUrl(url:Url) {
            if (await urlExists(url.label, url.domain))
                return;

            await DatabaseHelper.insertData(database, "urls", url);
        }

        export async function updateUrl(label:string, domain:string|null, url:Url) {
            if (!(await urlExists(label, domain)))
                return;

            return await DatabaseHelper.updateData(database, "urls", {label: label, domain: domain}, {$set: url});
        }

        export async function deleteUrl(label:string, domain:string|null) {
            if (!(await urlExists(label, domain)))
                return;

            return await DatabaseHelper.deleteData(database, "urls", {label: label, domain: domain});
        }

        export async function urlExists(label:string, domain:string|null):Promise<boolean> {
            var url = (await DatabaseHelper.selectData(database, "urls", {label: label, domain: domain}, {}))[0];
            return !!url;
        }

    }

}

// API for password Recovery
export module RecoveryHelper {

    // Create a Token
    export async function createToken (mail:string) {
        const token = generateRandomString(10);
        await DatabaseHelper.insertData(database, "recovery", {
            mail: mail,
            token: token
        })
        return token;
    }

    // Check if a token exists
    export async function tokenExists (token:string):Promise<boolean> {
        var result = await DatabaseHelper.selectData(database, "recovery", {token: token}, {})
        return result.length > 0;
    }

    // Get the email by a Token
    export function getEmail(token:string):string {
        return DatabaseHelper.selectData(database, "recovery", {token: token}, {})[0].mail
    }

}

// Database API for global MongoDB Connections
export module DatabaseHelper {

    // Select Data from a database
    export async function selectData(db_name:string, collection:string, query, sort):Promise<any[]> {

        // Connect to DB
        var db = await mongodb.MongoClient.connect(mongouri);
        var dbo = db.db(db_name);

        var result = await dbo.collection(collection).find(query).sort(sort).toArray();

        db.close();
        return result;
    }

    // Update Data from a database
    export async function updateData(dbName:string, collection:string, query, newValues) {
        // Connect to DB
        var db = await mongodb.MongoClient.connect(mongouri);
        var dbo = db.db(dbName);
        const {err} = await dbo.collection(collection).updateOne(query, newValues);
        if (err) throw err;

        db.close();
    }

    // Delete Data from a database
    export async function deleteData(dbName:string, collection:string, query) {
        // Connect to DB
        var db = await mongodb.MongoClient.connect(mongouri);
        var dbo = db.db(dbName);
        const {err} = await dbo.collection(collection).deleteOne(query);
        if (err) throw err;

        db.close();
    }

    // Insert Data into a database
    export async function insertData(dbName:string, collection:string, data) {
        // Connect to DB
        var db = await mongodb.MongoClient.connect(mongouri);
        var dbo = db.db(dbName);

        const {err} = await dbo.collection(collection).insertOne(data);
        if (err) throw err;

        db.close();
    }

}
