import * as cheerio from "cheerio";

const VALID_URL = new URL("https://mikudb.moe");

async function FetchFromMikuDB(url: string) {
    return await (await fetch(url)).text();
}

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

async function GetAlbumsFromProducer(url: string, page: number = 1): Promise<string[] | null> {
    if (!ValidateURL(url)) return null;

    const MikuDBData = await FetchFromMikuDB(`${url}/page/${page}`);
    const $ = cheerio.load(MikuDBData);
    const AlbumBoxes = $(".album-box");

    const ret: string[] = [];
    
    AlbumBoxes.each((_, el) => {
        const item_url = $($(el).children()[0]).attr("href");
        if (item_url) ret.push(item_url);
    })
    return ret;
}

type DownloadLink = {
    link: string,
    text: string,
    quality: string
}

async function GetDownloadLinksFromAlbumURL(url: string): Promise<DownloadLink[] | null> {
    if (!ValidateURL(url)) return null;

    const MikuDBData = await FetchFromMikuDB(url);
    const $ = cheerio.load(MikuDBData);
    const DownloadLinks = $(".download-bar > div > p");

    const ret: DownloadLink[] = [];

    DownloadLinks.children().each((_, el) => {
        const element = $(el);
        const link = element.attr("href");
        const text = element.text();
        const quality = $(el.next).text().trim();
        if (link) {
            ret.push({
                link: link,
                text: text,
                quality: quality
            });
        }
    });
    return ret;
}

console.log("Getting albums for Utsu-P");
const albums = await GetAlbumsFromProducer("https://mikudb.moe/producer/utsup/", 1);
if (albums == null) process.exit(1);
const TargetAlbum = albums[0];
console.log("Getting download links for", TargetAlbum);
const download_links = await GetDownloadLinksFromAlbumURL(TargetAlbum);
console.log(download_links);