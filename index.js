const express = require("express");
const bodyParser = require("body-parser");
const fs = require('fs');
const ytdl = require('ytdl-core');
const path = require('path');
var cors = require('cors')

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(cors())
// var allowedOrigins = ['https://video-rtc.com/'];
var corsOptions = {
    origin: 'https://video-rtc.com/',
    optionsSuccessStatus: 200 // For legacy browser support
}

app.use(cors(corsOptions));

// https://youtube.com/shorts/UHHEPlIEO6Y?feature=share



app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname + '/index.html'));

})

app.post("/youtube", async (req, res) => {
    const url = req.body.url;
    try {
        const info = await ytdl.getInfo(url);
        res.status(200).json({
            status: true,
            code: 200,
            data: info,
            formats: info.formats
        })
    } catch (error) {
        res.status(500).json({
            status: false,
            code: 500,
            error: error
        })
    }
    // ytdl(url)
    // .pipe(fs.createWriteStream('video.mp4')).on("finish",()=>{
    //     res.send("ok");
    // }).on("error",(err)=>{
    //     res.send(err);
    // });
})


app.listen(3000, () => {
    console.log("server is running on Port 3000");
})
