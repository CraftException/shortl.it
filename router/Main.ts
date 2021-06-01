// Lnkdto.link - Copyright (C) 2021 Moritz Kaufmann
// Main Requests

// Import Express
import * as express from "express";

// Import Version
const {version} = require("../package.json");

// Get Router
const router = express.Router();


router.get("/", (req, res) => {
    res.render("container", {navbarWithForm: true, view: "start"});
});

module.exports = router;