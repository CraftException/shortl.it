// Lnkdto.link - Copyright (C) 2021 Moritz Kaufmann
// Handle all View Requests

// Import Express
import * as express from "express";

// Import Version
const {version} = require("../package.json");

// Get Router
const router = express.Router();

router.get("/view/start", (req, res) => {
    res.render("views/start", {});
})

router.get("/view/stats", (req, res) => {
    res.render("views/stats", {});
})

module.exports = router;