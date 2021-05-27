// Lnkdto.link - Copyright (C) 2021 Moritz Kaufmann
// Number / String Generator

// Generate a random string with a specific length
export function generateRandomString (length:number):string {
    var result = [];

    // All possible characters
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_$%§!?';
    var charactersLength = characters.length;

    // Generate chars
    for (var i = 0; i < length; i++) {
        result.push(characters.charAt(Math.floor(Math.random() * charactersLength)));
    }

    return result.join('');
}