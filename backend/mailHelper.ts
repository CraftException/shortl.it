// Lnkdto.link - Copyright (C) 2021 Moritz Kaufmann
// Mail Helper

// Import Node-Mailer
import * as mailer from "nodemailer";

// Import the file system
import * as fs from "fs";

// Import EJS
import * as ejs from "ejs";

// Send a recovery mail
export function sendRecoveryMail (receiver:string, templateParameters:object) {
    let transport = mailer.createTransport({
        host: 'cmail01.mailhost24.de',
        tls: { rejectUnauthorized: false },
        port: 25,
        auth: {
            user: 'yourmail',
            pass: 'abcdefg'
        }
    });

    const message = {
        from: 'no-reply@lnkdto.link',
        to: receiver,
        subject: 'Change the password of your lnkdto.link account',
        text: 'Please enable HTML Support to read this mail!',
        html: ejs.render(fs.readFileSync("layout/partials/changePassword.ejs", "utf-8"), templateParameters)
    };
    transport.sendMail(message, function(err, info) {});
}