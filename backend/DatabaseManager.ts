// Lnkdto.link - Copyright (C) 2021 Moritz Kaufmann
// Database Manager

// Import File System
import * as fs from "fs";

// Import MongoDB
import * as mongodb from "mongodb";

// Import DeASync
import * as deasync from "deasync";

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
        password:string
    }

    // Check if a mail exists
    export async function mailExists(mail:string):Promise<boolean> {
        var result = await DatabaseHelper.selectData(database, "User", {mail:mail}, {})
        return result.length > 0
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

    // Get an account by mail
    export function getAccountByMail(mail):User {
        return DatabaseHelper.selectData(database, "User", {mail:mail}, {})[0]
    }

    // Create an Account
    export function createAccount(user:User) {
        DatabaseHelper.insertData(database, "User", user)
    }

    // Update Mail
    export function updateMail(displayName:string, newMail:string) {
        DatabaseHelper.updateData(database, "User", {displayname:displayName}, {$set:{mail:newMail}})
    }

    // Update Password
    export function updatePassword(displayName:string, password:string) {
        DatabaseHelper.updateData(database, "User", {displayname:displayName}, {$set:{password:password}})
    }

    // Upload a Password with a mail parameter
    export function updatePasswordByMail(mail:string, password:string) {
        DatabaseHelper.updateData(database, "User", {mail:mail}, {$set:{password:password}})
    }

}

// API for URL Management
export module UrlHelper {

    // Shorten-URL Model
    export interface ShortUrl {
        longUrl:string,
        shortUrl:string,
        user:string,
        clicks:number,
        clickTime:object[]
    }

    // Create a shorten URL
    export async function generateUrl(longURL:string, id:string):Promise<string> {
        var shortUrl = await generateURL();
        DatabaseHelper.insertData(database, "urls", {
            longUrl: longURL,
            shortUrl: shortUrl,
            user: id,
            clicks: 0,
            clickTime: {}
        });
        return shortUrl;
    }

    // Generate a short Url
    async function generateURL() {
        var shortUrl = generateRandomString(6);
        if (await urlExists(shortUrl))
            return generateURL();
        else
            return shortUrl;
    }

    // Get all Urls from a specific user
    export async function getUrlsFromUser(id: string):Promise<ShortUrl[]> {
        return await DatabaseHelper.selectData(database, "urls", {user: id}, {});
    }

    // Get the data of a specific url
    export async function getUrlData(shortUrl:string): Promise<ShortUrl> {
        return (await DatabaseHelper.selectData(database, "urls", {shortUrl: shortUrl}, {}))[0];
    }

    // Check if an url exists
    export async function urlExists(shortUrl:string):Promise<boolean> {
        var result = await DatabaseHelper.selectData(database, "urls", {shortUrl:shortUrl}, {})
        return result.length > 0;
    }

    // Get the long url of a shorten link
    export async function getLongUrl(shortUrl:string, countHits:boolean):Promise<string | boolean> {
        if (urlExists(shortUrl)) {
            const fetchedUrl:ShortUrl = await getUrlData(shortUrl);

            // Update Count Data,
            if (countHits) {
                fetchedUrl.clicks += 1;
                const currentDate = new Date().toLocaleDateString("de-DE");
                if (!fetchedUrl.clickTime[currentDate]) {
                    fetchedUrl.clickTime[currentDate] = 1;
                } else {
                    fetchedUrl.clickTime[currentDate] += 1;
                }
                await DatabaseHelper.updateData(database, "urls", {longUrl:fetchedUrl.longUrl}, {$set:{ clickTime: fetchedUrl.clickTime, clicks: fetchedUrl.clicks }})
            }

            return fetchedUrl.longUrl;
        } else {
            // Fallback, if the url doesn't exists
            return false;
        }
    }

    // Check if a user has access to an url
    export async function hasUserAccessToUrl(shortUrl:string, id:string):Promise<boolean> {
        var result =  await DatabaseHelper.selectData(database, "urls", {shortUrl:shortUrl,user:id}, {})
        return result.length > 0;
    }

    // Delete an Url
    export function deleteUrl(shortUrl:string) {
        DatabaseHelper.deleteData(database, "urls", {shortUrl: shortUrl});
    }

}

// API for password Recovery
export module RecoveryHelper {

    // Create a Token
    export function createToken (mail:string) {
        const token = generateRandomString(10);
        DatabaseHelper.insertData(database, "recovery", {
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
    export function updateData(db_name:string, collection:string, query, newValues) {
        // Connect to DB
        mongodb.MongoClient.connect(mongouri, function(err, db) {
            if (err) throw err;

            // Get DB
            var dbo = db.db(db_name);

            // Update Data
            dbo.collection(collection).updateOne(query, newValues, function(err, res) {
                if (err) throw err;

                // Close Database
                db.close();
            });

        });
    }

    // Delete Data from a database
    export function deleteData(db_name:string, collection:string, query) {
        // Connect to DB
        mongodb.MongoClient.connect(mongouri, function(err, db) {
            if (err) throw err;

            // Get DB
            var dbo = db.db(db_name);

            // Delete Data
            dbo.collection(collection).deleteOne(query, function(err, obj) {
                if (err) throw err;

                // Close Database
                db.close();
            });

        });
    }

    // Insert Data into a database
    export function insertData(db_name:string, collection:string, data) {
        // Connect to DB
        mongodb.MongoClient.connect(mongouri, function(err, db) {
            if (err) throw err;
            // Get DB
            var dbo = db.db(db_name);
            var dbo = db.db(db_name);

            // Insert Data
            dbo.collection(collection).insertOne(data, function(err, res) {
                if (err) throw err;
                db.close();
            });

        });
    }

}

// Generates a random string with a specific length
export function generateRandomString (length:number):string {
    var result           = [];
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;

    for ( var i = 0; i < length; i++ ) {

        result.push(characters.charAt(Math.floor(Math.random() *
            charactersLength)));
    }

    return result.join('');
}