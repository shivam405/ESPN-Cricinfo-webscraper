//const url="https://www.espncricinfo.com/series/ipl-2020-21-1210595/mumbai-indians-vs-chennai-super-kings-1st-match-1216492/full-scorecard";
const request=require("request");
const cheerio=require("cheerio");
const path=require("path");
const fs=require("fs");
const xlsx=require("xlsx");
function processScorecard(url){
    request(url,cb);
}

function cb(error,response,html)
{
    if(error)
    {
        console.log(error);
    }
    else
    {
       //console.log(html);
       extractMatchDetails(html);
    }
}

function extractMatchDetails(html){
    // ipl 
    // team
    //    player
    //        venue date opponent result runs balls four sixes strikerate

    //1st one venue,date,result(which goes same for both teams)

    //venue,date->.match-header-container .description
    //result->.match-header-container .status-text
    let $=cheerio.load(html);
    let descElem=$(".match-header-container .description");
    let result=$(".match-header-container .status-text");

    // console.log(descElem.text());
    // console.log(result.text());
    let stringArr=descElem.text().split(",");
    let venue=stringArr[1].trim();
    let date=stringArr[2].trim();

    result=result.text();

    let innings=$(".match-scorecard-page .Collapsible");

    //let htmlString="";

    for(let i=0;i<innings.length;i++)
    {
       // htmlString+=$(innings[i]).html();

       //1)team 2)opponent
       let teamName=$(innings[i]).find("h5").text();
       teamName=teamName.split("INNINGS")[0].trim();
       let opponentIndex=i==0?1:0;
       let opponentName=$(innings[opponentIndex]).find("h5").text();
       opponentName=opponentName.split("INNINGS")[0].trim();
       console.log(`${venue} | ${date} | ${teamName} | ${opponentName} | ${result}`);
       let cInning=$(innings[i]);

       let allRows=cInning.find(".table.batsman tbody tr");

       for(let j=0;j<allRows.length;j++)
       {
           let allCols=$(allRows[j]).find("td");
           let isWorthy=$(allCols[0]).hasClass("batsman-cell");
           if(isWorthy==true)
           {
               //player run balls four six sr
                let playerName=$(allCols[0]).text().trim();
                let runs=$(allCols[2]).text().trim();
                let balls=$(allCols[3]).text().trim();
                let fours=$(allCols[5]).text().trim();
                let sixes=$(allCols[6]).text().trim();
                let strikeRate=$(allCols[7]).text().trim();

                console.log(`${playerName} ${runs} ${balls} ${fours} ${sixes} ${strikeRate}`);

                processPlayer(teamName,playerName,runs,balls,fours,sixes,strikeRate,opponentName,venue,date,result);
           }
       }
    }
    //console.log(htmlString);
}

function processPlayer(teamName,playerName,runs,balls,fours,sixes,strikeRate,opponentName,venue,date,result)
{
    let teamPath=path.join(__dirname,"ipl",teamName);
    dirCreator(teamPath);
    let filepath=path.join(teamPath,playerName+".xlsx");

    let content=excelReader(filepath,playerName);

    let playerObj={
        //"teamName":"teamName" it's short form is teamName only both the key value assign to it
        teamName,
        playerName,
        runs,
        balls,
        fours,
        sixes,
        strikeRate,
        opponentName,
        venue,
        date,
        result
    }
    content.push(playerObj);
    excelWriter(filepath,content,playerName);
}

function dirCreator(filepath)
{
    if(fs.existsSync(filepath)==false)
    {
        fs.mkdirSync(filepath);
    }
}

////////////////////write in excel
function excelWriter(filepath,json,sheetName)
{
    //new worksheet
    let newWb=xlsx.utils.book_new();
    //json data->excel format convert
    let newWs=xlsx.utils.json_to_sheet(json);
    //newwb,ws,sheet name
    xlsx.utils.book_append_sheet(newWb,newWs,sheetName);
    //filepath
    xlsx.writeFile(newWb, filepath);

}



//////////////////////////////////////read in excel

function excelReader(filepath,sheetName)
{
    if(fs.existsSync(filepath)==false)
    {
        return [];
    }
    let wb=xlsx.readFile(filepath);

    let excelData=wb.Sheets[sheetName];

    let ans=xlsx.utils.sheet_to_json(excelData);
    return ans; 
}

module.exports ={
    ps:processScorecard
}