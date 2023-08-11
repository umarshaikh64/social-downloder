const express = require("express");
const bodyParser = require("body-parser");
const ytdl = require('ytdl-core');
const path = require('path');
const request = require("request");
const { getTikTokIdVideo } = require("./app.helper");
const axios = require("axios").default;
const https = require("https")
var cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const PORT = 3000;
app.use(cors({
  origin: 'https://video-rtc.com'
}));
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
});

app.post("/instagram", async (req, res) => {
    const url = req.body.url
    if (!url || !url.startsWith("https://www.instagram.com/")) {
        return res.status(400).json({
            status: false,
            code: 400,
            error: "The link you have entered is invalid. "
        });
    }
    let options = {
        method: 'GET',
        url: 'https://instagram-bulk-profile-scrapper.p.rapidapi.com/clients/api/ig/media_by_id',
        headers: {
            'X-RapidAPI-Key': 'baf38d7eb2msh17d5250e3fcb6b1p11aecajsn8f559cbcb328',
            'X-RapidAPI-Host': 'instagram-bulk-profile-scrapper.p.rapidapi.com'
        }
    };
    if (url.startsWith("https://www.instagram.com/reel/")) {
        const instagramRegex = /(?:https?:\/\/www\.)?instagram\.com\S*?\/reel\/(\w{11})\/?/;
        let shortcode = url.match(instagramRegex);
        if (shortcode[1] == null) {
            return res.status(400).json({
                status: false,
                code: 400,
                error: "The link you have entered is invalid. "
            });
        }
        options['params'] = {
            shortcode: shortcode[1],
            response_type: 'reels'
        }
    } else if (url.startsWith("https://www.instagram.com/p/")) {
        const instagramRegex = /(?:https?:\/\/www\.)?instagram\.com\S*?\/p\/(\w{11})\/?/;
        let shortcode = url.match(instagramRegex);
        if (shortcode[1] == null) {
            return res.status(400).json({
                status: false,
                code: 400,
                error: "The link you have entered is invalid. "
            });
        }
        options['params'] = {
            shortcode: shortcode[1],
            response_type: 'feeds'
        }
    } else {
        return res.status(400).json({
            status: false,
            code: 400,
            error: "The link you have entered is invalid. "
        });
    }
    try {
        const response = await axios.request(options);
        res.status(200).json({
            status: false,
            code: 200,
            data: response.data
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            code: 500,
            error: error
        });
    }

});

app.post("/facebook", async (req, res) => {
    const url = req.body.url;
    let options = {
        'method': 'POST',
        'url': 'https://www.getfvid.com/downloader',
        formData: {
            'url': url
        }
    }
    request(options, function (error, response) {
        if (error) return res.status(500).json({
            status: false,
            code: 500,
            error: error,
        });

        let private = response.body.match(/Uh-Oh! This video might be private and not publi/g)
        if (private) {
            console.log('\x1b[31m%s\x1b[0m', `[-] This Video Is Private`)
            return res.status(400).json({
                status: false,
                code: 400,
                error: "This Video Is Private",
            });
        }
        const regexNama = /<p class="card-text">(.*?)<\/p>/g
        let arrNama = [...response.body.matchAll(regexNama)]
        if (arrNama[0] != undefined) {
            namaVideo = arrNama[0][1] + ".mp4"
        }
        const rgx = /<a href="(.+?)" target="_blank" class="btn btn-download"(.+?)>(.+?)<\/a>/g
        let arr = [...response.body.matchAll(rgx)]
        let resAkhir = [];
        arr.map((item, i) => {
            if (i == 0) {
                if (item[3].match('<strong>HD</strong>')) {
                    item[3] = "Download in HD Quality"
                }
            }
            resAkhir.push({
                quality: item[3],
                url: item[1].replace(/amp;/gi, '')
            })
        })
        if (resAkhir.length > 0) {
            res.status(200).json({
                status: false,
                code: 200,
                data: resAkhir
            });
        } else {
            res.status(400).json({
                status: false,
                code: 400,
                message: "Invalid Video Url"
            });

        }
    });
})

app.post("/twitter", async (req, res) => {
    const url = req.body.url
    const TWEET_ID = url.split("/")[5]
    let options = {
        url: `https://api.twitterpicker.com/tweet/mediav2?id=${TWEET_ID}&wa=1`,
        method: 'GET',
    }
    try {
        const response = await axios.request(options);
        res.status(200).json({
            status: false,
            code: 200,
            data: response.data
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            code: 500,
            error: error
        });
    }
})

app.post("/tiktok", async (req, res) => {
    const url = req.body.url;
    const idVideo = await getTikTokIdVideo(url)
    if (idVideo == null) {
        return res.status(400).json({
            status: false,
            code: 400,
            message: "The Url is invalid"
        })
    }
    const API_URL = `https://api16-normal-c-useast1a.tiktokv.com/aweme/v1/feed/?aweme_id=${idVideo}`;
    try {
        const request1 = await axios.request({
            url: API_URL,
            method: "GET",
            headers: {
                "User-Agent": 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36'
            }
        });
        res.status(200).json({
            status: true,
            code: 200,
            data: request1.data.aweme_list
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            code: 500,
            error: error
        });
    }
});


// app.post("/vimeo", async (req, res) => {
//     var inputVideoUrl = req.body.url
//     if (inputVideoUrl.slice(-1) === '/') {
//         inputVideoUrl = inputVideoUrl.slice(0, -1);
//     }
//     const videoId = inputVideoUrl.split('/').pop();
//     const videoJsonConfigUrl = `https://player.vimeo.com/video/${videoId}/config`;
//     await new Promise((resolve, reject) => {
//         https.get(videoJsonConfigUrl, (res) => {
//             let result = '';
//             res.on('data', data => {
//                 result += data;
//             });
//             res.on('error', err => {
//                 reject(err);
//             });
//             res.on('end', () => {
//                 resolve(JSON.parse(result));
//             });
//         });
//     }).then((resp) => {
//         res.status(200).json({
//             status: false,
//             code: 200,
//             data: resp
//         });
//     }).catch((error) => {
//         res.status(500).json({
//             status: false,
//             code: 500,
//             error: error
//         });
//     });
// })



app.post("/vimeoTaskId", async (req, res) => {
    const fId = req.body.fId;
    const url = req.body.url
    if (fId == "" || fId == null || fId == undefined && url == "" || url == null || url == undefined) {
        return res.status(400).json({
            status: false,
            code: 400,
            error: "Formate is required"
        })
    }
    await axios.post("https://api.w03.savethevideo.com/tasks", {
        "type": "download",
        "url": url,
        "format": fId
    }).then((res1) => {
        res.status(200).json({
            status: true,
            code: 200,
            data: res1.data
        });
    }).catch((er) => {
        res.status(500).json({
            status: false,
            code: 500,
            error: er
        });
    })
});


app.post("/vimeoDownload/:id", async (req, res) => {
    const id = req.params.id;
    console.log(id);
    if (id == "" || id == null || id == undefined) {
        return res.status(400).json({
            status: false,
            code: 400,
            error: "Download Id is required"
        })
    }
    await axios.get(`https://api.w03.savethevideo.com/tasks/${id}`).then((res1) => {
        res.status(200).json({
            status: true,
            code: 200,
            data: res1.data
        });
    }).catch((er) => {
        res.status(500).json({
            status: false,
            code: 500,
            error: er
        });
    })
});
app.post("/vimeo", async (req, res) => {
    var inputVideoUrl = req.body.url
    if (!inputVideoUrl.startsWith("https://vimeo.com/")) {
        return res.status(400).json({
            status: false,
            code: 400,
            error: "The Url is invalid"
        })
    }

    await axios.post("https://api.w03.savethevideo.com/tasks", {
        "type": "info",
        "url": inputVideoUrl
    }).then(async (res1) => {
        await axios.get(`https://api.w03.savethevideo.com/videos/${res1.data.id}`).then((resp) => {
            res.status(200).json({
                status: true,
                code: 200,
                data: resp.data
            });
        }).catch((er) => {
            res.status(500).json({
                status: false,
                code: 500,
                error: er
            });
        })
    }).catch((e) => {
        res.status(500).json({
            status: false,
            code: 500,
            error: e
        });
    });
})

app.listen(PORT, () => {
    console.log("server is running on Port 3000");
})






