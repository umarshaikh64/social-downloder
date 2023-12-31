const axios = require("axios");
const cheerio = require("cheerio");

const getVideo = async url => {
    const html = await axios.get(url);
    const $ = cheerio.load(html.data);
    const videoString = $("meta[property='og:video']").attr("content");
    console.log($("meta[property='og:video']").attr('src'))
    return videoString;
};


const getTikTokIdVideo = (url) => {
    if (url.startsWith('https://www.tiktok.com/')) {
        const matching = url.includes("/video/")
        if (!matching) {
            console.log("[X] Error: URL not found");
            return null;
        }
        const idVideo = url.substring(url.indexOf("/video/") + 7, url.length);
        return (idVideo.length > 19) ? idVideo.substring(0, idVideo.indexOf("?")) : idVideo;
    }else if (url.startsWith('https://vt.tiktok.com/')) {
        const urlParts = url.split('/');
        const videoId = urlParts[urlParts.length - 2];
        return videoId;
    }

    // const matching = url.includes("/video/")
    // if (!matching) {
    //     console.log("[X] Error: URL not found");
    //     return null;
    // }
    // const idVideo = url.substring(url.indexOf("/video/") + 7, url.length);
    // return (idVideo.length > 19) ? idVideo.substring(0, idVideo.indexOf("?")) : idVideo;
}




module.exports = {
    getVideo,
    getTikTokIdVideo

}
