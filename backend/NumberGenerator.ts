// Lnkdto.link - Copyright (C) 2021 Moritz Kaufmann
// Number / String Generator

export function generateRandomString (length:number):string {
    var result = [];
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_$%§!?';
    var charactersLength = characters.length;

    for (var i = 0; i < length; i++) {
        result.push(characters.charAt(Math.floor(Math.random() * charactersLength)));
    }

    return result.join('');
}