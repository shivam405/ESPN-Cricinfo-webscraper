const url="https://www.espncricinfo.com/series/ipl-2020-21-1210595";
const fs=require("fs");
const path=require("path");
const request=require("request");
const cheerio=require("cheerio");
const allMatchObj=require("./allmatches");

//home page
const iplPath=path.join(__dirname,"ipl");
dirCreator(iplPath);

request(url,cb);

function cb(error,response,html)
{
    if(error)
    {
        console.log(error);
    }
    else
    {
       //console.log(html);
       extractLink(html);
    }
}

function extractLink(html)
{
    let $=cheerio.load(html);
    let anchorElem=$("a[data-hover='View All Results']");
    let link=$(anchorElem).attr("href");
    //console.log(link);
    let fullLink="https://www.espncricinfo.com"+link;
    //console.log(fullLink);
    allMatchObj.gAlmatches(fullLink);
}

function dirCreator(filepath)
{
    if(fs.existsSync(filepath)==false)
    {
        fs.mkdirSync(filepath);
    }
}