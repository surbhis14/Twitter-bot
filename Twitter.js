const puppeteer = require('puppeteer');
const fs = require('fs');
const username = 'bot_pep';
const password = 'pepbot123';
let browser;
let page;

(async function () {
    browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: ["--start-maximized"],
        slowMo : 100
    });

    page = await browser.newPage();

    await page.goto('https://twitter.com/login');

    //LOGIN
    await page.type('input[name="session[username_or_email]"]', username, { delay: 25 });
    await page.type('input[name="session[password]"]', password, { delay: 25 });
    await page.click('div[data-testid="LoginForm_Login_Button"]');

    //SEARCH TERM
    await page.waitForSelector('input[data-testid="SearchBox_Search_Input"]');
    await page.type('input[data-testid="SearchBox_Search_Input"]', '#microsoft', { delay: 25 });
    await page.keyboard.press('Enter');


    //GOTO LATEST
    await page.waitForSelector(".css-4rbku5.css-18t94o4.css-1dbjc4n.r-1awozwy.r-1loqt21.r-6koalj.r-eqz5dr.r-16y2uox.r-1h3ijdo.r-1777fci.r-s8bhmr.r-1ny4l3l.r-1qhn6m8.r-i023vh.r-o7ynqc.r-6416eg");
    let latest = await page.$$('.css-4rbku5.css-18t94o4.css-1dbjc4n.r-1awozwy.r-1loqt21.r-6koalj.r-eqz5dr.r-16y2uox.r-1h3ijdo.r-1777fci.r-s8bhmr.r-1ny4l3l.r-1qhn6m8.r-i023vh.r-o7ynqc.r-6416eg');
    await latest[1].click();
    console.log("done");

    await page.waitForSelector(".css-1dbjc4n.r-1loqt21.r-18u37iz.r-1ny4l3l.r-1udh08x.r-1qhn6m8.r-i023vh.r-o7ynqc.r-6416eg");
    let posts = await page.$$(".css-1dbjc4n.r-1wbh5a2.r-dnmrzs a");
    console.log(posts.length);
    let profile_url = [];
    for (let i = 0; i <= 10; i+=2) {
        let href = await page.evaluate(function (ele) {
            return ele.getAttribute("href");
        }, posts[i]);
        profile_url.push(href);
    }
    
    let finalData ={};
    for(let i=0; i< profile_url.length;i++){
        let href =  profile_url[i];
        let temp={
            URL : "https://twitter.com" + href,
        }
        finalData[i+1] = temp;
    }
    fs.writeFileSync('profile_URLs.json', JSON.stringify(finalData))

    for(let i = 0; i < profile_url.length;i++){
        await follow(profile_url[i], await browser.newPage());    
    }
})();
let count = 0;
async function follow(href, tab){
    await tab.goto("https://twitter.com" + href);
    
    //PROFILE PICTURE SELECTOR
    await tab.waitForSelector(".css-1dbjc4n.r-1twgtwe.r-sdzlij.r-rs99b7.r-1p0dtai.r-1mi75qu.r-1d2f490.r-1ny4l3l.r-u8s1d.r-zchlnj.r-ipm5af.r-o7ynqc.r-6416eg");
    let profile_class = await tab.$$(".css-1dbjc4n.r-1twgtwe.r-sdzlij.r-rs99b7.r-1p0dtai.r-1mi75qu.r-1d2f490.r-1ny4l3l.r-u8s1d.r-zchlnj.r-ipm5af.r-o7ynqc.r-6416eg");
    count++;

    await tab.screenshot({
        path : `./profile_picture/ screenshot${count}.jpg`,
        type : "jpeg",
        // clip : {x : 400 , y:400 , width : 300 , height: 300}
    });

    await tab.waitForSelector(".css-1dbjc4n.r-6gpygo");
    let follow_url = await tab.$$(".css-18t94o4.css-1dbjc4n.r-1niwhzg.r-p1n3y5.r-sdzlij.r-1phboty.r-rs99b7.r-1w2pmg.r-ero68b.r-1gg2371.r-1ny4l3l.r-1fneopy.r-o7ynqc.r-6416eg.r-lrvibr");
    if(follow_url[0] != undefined){
        await follow_url[0].click();
    }

    //PROFILE PICTURE CLICK
    await profile_class[0].click();
    await tab.close();
    

}
