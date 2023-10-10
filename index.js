const fs = require("fs");
const path = require("path");

const express = require("express");
const app = express();

const serverPort = 3888;
const rootPath = process.argv[2] || __dirname;

const pTemplate = fs.readFileSync(__dirname + "/pages/template.html", "utf-8");
const pNotFound = fs.readFileSync(__dirname + "/pages/404.html", "utf-8");

app.use("/", express.static(rootPath));

app.all("*", (req, res) => {
    const accessPath = decodeURIComponent(rootPath + req.url);
    if (!fs.existsSync(accessPath)) {
        res.send(
            pNotFound.replace("{{requested}}", req.url)
        );
        return;
    }
    
    var files = fs.readdirSync(accessPath);
    var htmlFiles = files.map(file => `<li><a href="./${path.basename(file)}">${file}</a></li>`).join('');

    if (req.url != "/") {
        htmlFiles = `<li class="master"><a href="..">&leftarrow; Go back</a></li>` + htmlFiles;
    }

    res.send(
        pTemplate.replace("{{title}}", req.url)
                 .replace("{{files}}", htmlFiles)
    );
});

app.listen(serverPort, () => {
    console.log("[INFO] Shared server started");
    console.log(`[INFO] Live at http://localhost:${serverport}`);
});