const express = require("express");
const bodyParser = require("body-parser");
const ytdl = require('ytdl-core');
const path = require('path');
const request = require("request");
const { getTikTokIdVideo } = require("./app.helper");
const axios = require("axios").default;
var https = require('https');
var fs = require('fs');
const cors = require("cors");
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const PORT = 3000;


app.use(function (req, res, next) {
    //Enabling CORS
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-client-key, x-client-token, x-client-secret, Authorization");
    next();
});


app.use(cors(
    {origin: 'https://video-rtc.com'}
));

app.use(express.static(path.join(__dirname + "/downloads/")))
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname + '/index.html'));
});



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
    const { url } = req.body;
    if (!url || !url.startsWith("https://www.instagram.com/")) {
        return res.status(400).json({
            status: false,
            code: 400,
            error: "The link or type you have entered is invalid."
        });
    }
    let query;
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
        query = "response_type=reels&shortcode=" + shortcode[1];
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
        query = "response_type=reels&shortcode=" + shortcode[1];
    } else {
        return res.status(400).json({
            status: false,
            code: 400,
            error: "The link you have entered is invalid. "
        });
    }
    // type="reels,feed"


    const options = {
        method: "GET",
        url: `https://instagram-bulk-profile-scrapper.p.rapidapi.com/clients/api/ig/media_by_id?corsEnabled=true&${query}`,
        headers: {
            'X-RapidAPI-Key': 'ef60724516mshe06808ae9cf170ap1e9908jsn36a5638bc979',
            'X-RapidAPI-Host': 'instagram-bulk-profile-scrapper.p.rapidapi.com'
        }
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



// app.post("/instagram", async (req, res) => {
//     const url = req.body.url
//     if (!url || !url.startsWith("https://www.instagram.com/")) {
//         return res.status(400).json({
//             status: false,
//             code: 400,
//             error: "The link you have entered is invalid. "
//         });
//     }
//     let options = {
//         method: 'GET',
//         url: 'https://instagram-bulk-profile-scrapper.p.rapidapi.com/clients/api/ig/media_by_id',
//         headers: {
//             'X-RapidAPI-Key': 'baf38d7eb2msh17d5250e3fcb6b1p11aecajsn8f559cbcb328',
//             'X-RapidAPI-Host': 'instagram-bulk-profile-scrapper.p.rapidapi.com'
//         }
//     };
//     if (url.startsWith("https://www.instagram.com/reel/")) {
//         const instagramRegex = /(?:https?:\/\/www\.)?instagram\.com\S*?\/reel\/(\w{11})\/?/;
//         let shortcode = url.match(instagramRegex);
//         if (shortcode[1] == null) {
//             return res.status(400).json({
//                 status: false,
//                 code: 400,
//                 error: "The link you have entered is invalid. "
//             });
//         }
//         options['params'] = {
//             shortcode: shortcode[1],
//             response_type: 'reels'
//         }
//     } else if (url.startsWith("https://www.instagram.com/p/")) {
//         const instagramRegex = /(?:https?:\/\/www\.)?instagram\.com\S*?\/p\/(\w{11})\/?/;
//         let shortcode = url.match(instagramRegex);
//         if (shortcode[1] == null) {
//             return res.status(400).json({
//                 status: false,
//                 code: 400,
//                 error: "The link you have entered is invalid. "
//             });
//         }
//         options['params'] = {
//             shortcode: shortcode[1],
//             response_type: 'feeds'
//         }
//     } else {
//         return res.status(400).json({
//             status: false,
//             code: 400,
//             error: "The link you have entered is invalid. "
//         });
//     }
//     try {
//         const response = await axios.request(options);
//         res.status(200).json({
//             status: false,
//             code: 200,
//             data: response.data
//         });
//     } catch (error) {
//         res.status(500).json({
//             status: false,
//             code: 500,
//             error: error
//         });
//     }

// });


// app.post("/fbDownload", async (req, res) => {
//     const url = req.body.url;
//     const formData = new FormData()
//     formData.append("url", url);
//     formData.append("host", "facebook");
//     formData.append("action", "call_fb_yt_downloader")
//     formData.append("security", "794da90332")
//     formData.append("mp3", "off")
//     try {
//         const resp = await axios.post("https://snaptik.ink/wp-admin/admin-ajax.php", formData);
//         res.status(200).json({
//             status: true,
//             code: 200,
//             data: resp.data
//         })
//     } catch (error) {
//         res.status(500).json({
//             status: false,
//             code: 500,
//             error: error
//         });
//     }
// });


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





app.post('/downloadMedia', async (req, res) => {
       try {
        https.get(decodeURIComponent(req.body.url), function (response) {
            res.setHeader("Content-Length", response.headers["content-length"]);
            if (response.statusCode >= 400) return res.status(500).send("Error");
            response.on("data", function (chunk) {
                res.write(chunk);
            });
            response.on("end", function () {
                res.end();
            });
        }).on('error', error => {
            reject(error);
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            code: 500,
            error: error
        });
    }
    
})



app.post('/downloadFB', async (req, res) => {
    try {
        await download(req.body.url, "./downloads/temp.mp4");
        res.status(200).json(
            {
                status: true,
                code: 200,
                data: {
                    filename: "/temp.mp4"
                }
            }
        );
    } catch (error) {
        res.status(500).json({
            status: false,
            code: 500,
            error: error
        });
    }
})

app.get("/downloadFile/:filename/:name", (req, res) => {
    const filename = req.params.filename;
    const name = req.params.name
    if (filename == "" && filename == undefined) {
        return res.status(400).json({
            status: false,
            code: 400,
            error: "Please Pass the file name"
        });
    }

    const file = `${__dirname}/temp.${filename.split('.')[1]}`;

    if (fs.existsSync(file)) {
        res.download(file, filename,
            (err) => {
                if (err) {
                    res.status(400).json({
                        status: false,
                        code: 400,
                        error: err,
                    })
                }
            });
        // fs.unlink(file, () => { });
    } else {
        return res.status(404).json({
            status: false,
            code: 404,
            error: "File not Founded"
        });
    }

});


async function download(uri, filename) {
 return new Promise((resolve, reject) => {
        const fileStream = fs.createWriteStream(filename);
        https.get(decodeURIComponent(uri), function (response) {
            // res.setHeader("Content-Length", response.headers["content-length"]);
            if (response.statusCode >= 400) reject("Server Error");
            response.pipe(fileStream)
            fileStream.on('finish', () => {
                fileStream.close();
                resolve();
            });
            fileStream.on('error', error => {
                fs.unlink(filename, () => { }); // Delete the file
                reject(error);
            });
            // response.on("data", function (chunk) {
            //     res.write(chunk);
            // });
            // response.on("end", function () {
            //     res.end();
            // });
        }).on('error', error => {
            reject(error);
        });
    });
}




app.listen(PORT, () => {
    console.log("server is running on Port 3000");
})
