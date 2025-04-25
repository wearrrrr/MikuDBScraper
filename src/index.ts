import * as cheerio from "cheerio";

const VALID_URL = new URL("https://mikudb.moe");

function ValidateURL(str: string) {
    if (!URL.canParse(str)) {
        console.error("Not a valid URL! Passed in:", str)
        return false
    };
    const url = new URL(str);
    if (url.hostname != VALID_URL.hostname) {
        console.error("Not a valid domain! Hostname is:", url.hostname, `Expected: ${VALID_URL.hostname}`);
        return false
    }

    return true;
}

async function GetAlbumsFromProducer(url: string, page: number = 1) {
    if (!ValidateURL(url)) return null;

    const MikuDBData = await (await fetch(`${url}/page/${page}`)).text();
    const $ = cheerio.load(MikuDBData);
    const AlbumBoxes = $(".album-box");

    let ret: string[] = [];
    
    AlbumBoxes.each((_, el) => {
        let item_url = $($(el).children()[0]).attr("href");
        if (item_url) ret.push(item_url);
    })
    return ret;
}

function GetDownloadLinksFromAlbumURL(url: string) {
    if (!ValidateURL(url)) return null;
}

let albums = await GetAlbumsFromProducer("https://mikudb.moe/producer/utsup/", 1);
console.log(albums);