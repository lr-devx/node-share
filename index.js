const fs = require("fs");
const path = require("path");

const express = require("express");
const app = express();

const config = require("./config.json");

const serverPort = config.port || 3888;
const rootPath   = config.rootPath || __dirname;

const pTemplate = fs.readFileSync(__dirname + "/pages/template.html", "utf-8");
const pNotFound = fs.readFileSync(__dirname + "/pages/404.html", "utf-8");

const whitelistMiddleware = (req, res, next) => {
    if (!config.useWhitelist) {
        next();
        return;
    }

    var requestIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    
    if (!config.whitelistedIPs.includes(requestIp)) {
        console.log(`[INFO] Denied access to ${requestIp}!`);
        res.status(403).send("Access Denied");
        return;
    }

    next();
};

app.use("/", whitelistMiddleware, express.static(rootPath));

app.all("*", whitelistMiddleware, (req, res) => {
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

app.listen(serverPort, "0.0.0.0", () => {
    console.log("[INFO] Shared server started");
    console.log(`[INFO] Live at http://localhost:${serverPort}`);
});