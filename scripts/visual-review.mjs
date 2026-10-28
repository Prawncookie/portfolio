import {createRequire} from 'node:module';
const require=createRequire('C:/Users/Basit/dev/New folder/package.json');
const {chromium}=require('playwright');
const browser=await chromium.launch({channel:'chrome',headless:true});
try {
  for(const width of [390,768,1440]) {
    const page=await browser.newPage({viewport:{width,height:1000},reducedMotion:'reduce'});
    await page.goto('http://127.0.0.1:4173');
    const output=name=>new URL(`../qa/review-${width}-${name}.png`,import.meta.url).pathname.replace(/^\/([A-Z]:)/,'$1');
    for(const selector of ['#luxgear','#about','#contact']) {
      await page.locator(selector).scrollIntoViewIfNeeded();
      await page.screenshot({path:output(selector.slice(1))});
    }
    await page.getByRole('tab',{name:'04 Documents',exact:true}).click();
    await page.locator('.system-explorer').screenshot({path:output('documents')});
    await page.goto('http://127.0.0.1:4173/luxgear.html');
    for(const selector of ['.case-hero','[aria-labelledby="conversion-title"]','[aria-labelledby="analysis-title"]','.case-progress']) {
      const name=selector==='.case-hero'?'case-hero':selector==='.case-progress'?'case-progress':selector.includes('conversion')?'case-conversion':'case-analysis';
      await page.locator(selector).screenshot({path:output(name)});
    }
    console.log(JSON.stringify({width,active:await page.evaluate(()=>document.activeElement.outerHTML.slice(0,150)),skip:await page.locator('.skip-link').evaluate(el=>({focus:el.matches(':focus'),transform:getComputedStyle(el).transform,rect:el.getBoundingClientRect().toJSON()}))}));
    await page.close();
  }
}finally{await browser.close();}
