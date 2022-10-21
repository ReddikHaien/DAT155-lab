const express = require("express");
const path = require('path');

const app = express();

app.get("/", (_,res) => {
    res.redirect("index.html")
})

app.use('/', express.static(path.join(__dirname, 'dist')))

app.listen(3000);