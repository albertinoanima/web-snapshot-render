require('dotenv').config();
const express = require("express");
const app = express();

const cors = require('cors');
const path = require('path');
const puppeteer = require('puppeteer');

const PORT = process.env.PORT || 5000;

app.use(cors());
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, '/index.html'));
});

app.get("/snapshot", async (req, res) => {
    const { query } = req;
    const { url } = query;

    const imageName = `screenshot_${String(url).split(".")[0].replace("http://", "")}.png`;

    try {
        const browser = await puppeteer.launch({
            timeout: 0,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        await page.goto(String(url));

        page.setViewport({ width: 1024, height: 720 })
        const buffer = await page.screenshot({ path: imageName });
        const image64 = buffer.toString("base64");
        
        res.status(200).json({ data: image64 });
        await browser.close(); 
        //res.sendFile(__dirname + "/" + imageName);
    } catch (err) {
        console.log(err);
        res.status(500).json({ data: "", message: err.toString() });
    }
})

app.listen(PORT, () => {
    console.log("Server started... ate port: " + PORT);
})
