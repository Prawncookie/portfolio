// Read-only public-site screenshots for a LOCAL portfolio review. No forms or
// logins, cookies, private records, API keys, analytics or account changes.
import { createRequire } from "node:module";
import { mkdir,writeFile,copyFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
const require=createRequire("C:/Users/Basit/dev/New folder/package.json");
const {chromium}=require("playwright");
const sharp=require("sharp");
const target=new URL("../dist/assets/",import.meta.url);
await mkdir(target,{recursive:true});
const browser=await chromium.launch({channel:"chrome",headless:true});
const context=await browser.newContext({viewport:{width:1440,height:1000},deviceScaleFactor:1,reducedMotion:"reduce"});
const sources=[
  ["luxgear","https://www.luxgear.ae"],
  ["neopraxis","https://www.neopraxis.net"],
  ["heaven-hearts","https://www.heavenhearts.com"],
  ["alee","https://photographybyalee.com"],
  ["aapl","https://aapl-stock-predictor.vercel.app"],
].filter(([name])=>!process.argv.includes('--only-aapl')||name==='aapl');
const log=[];
try {
  for(const [name,url] of sources){
    const page=await context.newPage();
    const response=await page.goto(url,{waitUntil:"domcontentloaded",timeout:45000});
    if(!response?.ok()) {
      // Do not evade a site's access check. The owner already retains this
      // public-site capture from7September; preserve its honest capture date.
      if(name==='alee' && response?.status()===403) {
        await copyFile('C:/Users/Basit/dev/Neo/public/images/work/photography-by-alee.webp',new URL('alee.webp',target));
        log.push({name,url,status:403,captureDate:'2026-09-07',source:'Existing owner-retained public website capture; live content independently checked with TinyFish22October.'});
        await page.close(); continue;
      }
      throw Error(`${name}: source returned${response?.status()}`);
    }
    await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].filter(img=>img.getBoundingClientRect().top<innerHeight).map(img=>img.complete?Promise.resolve():new Promise(resolve=>{img.addEventListener('load',resolve,{once:true});img.addEventListener('error',resolve,{once:true});setTimeout(resolve,8000);})));});
    await page.waitForTimeout(1800);
    const capture=await page.screenshot();
    await sharp(capture).resize(1440,1000,{fit:"cover"}).webp({quality:86}).toFile(fileURLToPath(new URL(`${name}.webp`,target)));
    log.push({name,url:page.url(),status:response.status(),title:await page.title()});
    await page.close();
  }
  if(!process.argv.includes('--only-aapl')) await writeFile(new URL("../docs/captures.json",import.meta.url),JSON.stringify({checkedOn:"2026-10-22",sources:log},null,2));
  console.log(JSON.stringify(log));
}finally{await browser.close();}
