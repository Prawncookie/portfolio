import assert from "node:assert/strict";
import {createRequire} from "node:module";
import {mkdir,writeFile,readFile} from "node:fs/promises";
const require=createRequire("C:/Users/Basit/dev/New folder/package.json");
const {chromium}=require("playwright");
const browser=await chromium.launch({channel:"chrome",headless:true});
const context=await browser.newContext({permissions:["clipboard-read","clipboard-write"],viewport:{width:1440,height:1080}});
const page=await context.newPage();
const errors=[],requests=[];
const checks=[];
page.on('pageerror',e=>errors.push(e.message));
page.on('request',request=>requests.push(request.url()));
const origin='http://127.0.0.1:4173';
await mkdir(new URL('../qa/',import.meta.url),{recursive:true});
try {
  const response=await page.goto(origin);
  assert.equal(response.status(),200);
  await page.evaluate(()=>document.fonts.ready);
  await page.keyboard.press('Tab');
  assert.equal(await page.locator('.skip-link').evaluate(el=>el===document.activeElement),true);
  assert.equal(await page.locator('.skip-link').evaluate(el=>getComputedStyle(el).clipPath),'none');
  await page.keyboard.press('Enter');
  assert.equal(new URL(page.url()).hash,'#main');
  assert.equal(await page.locator('h1').count(),1);
  assert.equal(await page.locator('article.project').count(),5);
  assert.equal(await page.locator('meta[name="robots"]').getAttribute('content'),'noindex, nofollow');
  assert.equal(await page.getByRole('link',{name:'Visit live site'}).count(),5);
  for(const a of await page.locator('a[target="_blank"]').all())assert.match(await a.getAttribute('rel'),/noopener/);
  for(const link of await page.locator('a[href]').all()) {
    const target=await link.getAttribute('href');
    if(target.startsWith('http')||target.startsWith('mailto:'))continue;
    const url=new URL(target,page.url());
    const linked=await context.request.get(url.href);
    assert.equal(linked.status(),200);
    if(url.hash)assert.ok((await linked.text()).includes(`id="${url.hash.slice(1)}"`),`Missing anchor ${target}`);
  }
  for(const image of await page.locator('img').all()) {
    await image.scrollIntoViewIfNeeded();
    await image.evaluate(img=>img.decode());
    assert.ok(await image.evaluate(img=>img.naturalWidth>0));
  }
  checks.push('five deployed projects, local assets and safe external links');
  const cvResponse=await context.request.get(`${origin}/assets/Basit-Shahab-Resume.pdf`);
  assert.equal(cvResponse.status(),200);
  assert.match(cvResponse.headers()['content-type'],/application\/pdf/);
  const cvBytes=await cvResponse.body();
  assert.equal(cvBytes.subarray(0,5).toString(),'%PDF-');
  assert.deepEqual(cvBytes,await readFile('C:/Users/Basit/dev/Basit-Shahab-Resume/output/pdf/Basit-Shahab-AI-Automation-Engineer-Resume.pdf'));
  const downloadPromise=page.waitForEvent('download');
  await page.getByRole('link',{name:'Download CV',exact:true}).click();
  const download=await downloadPromise;
  assert.equal(download.suggestedFilename(),'Basit-Shahab-Resume.pdf');
  assert.deepEqual(await readFile(await download.path()),cvBytes);
  const impactText=await page.locator('.impact-summary').innerText();
  assert.match(impactText,/93–95%/);
  assert.match(impactText,/Estimate from reported processing times/);
  checks.push('actual CV download matches canonical one-page resume; estimated impact retains its basis');
  await page.getByRole('button',{name:'Business tools',exact:true}).click();
  assert.equal(await page.locator('.project:visible').count(),1);
  assert.equal(await page.getByRole('heading',{name:'Lux Gear',exact:true}).count(),1);
  assert.equal(await page.locator('#filter-status').textContent(),'1 project');
  await page.getByRole('button',{name:'Websites',exact:true}).click();
  assert.equal(await page.locator('.project:visible').count(),4);
  await page.getByRole('button',{name:'ML & data',exact:true}).click();
  assert.equal(await page.locator('.project:visible').count(),1);
  assert.equal(await page.locator('.project:visible h3').textContent(),'AAPL Stock Predictor');
  assert.equal(await page.locator('#filter-status').textContent(),'1 project');
  await page.getByRole('button',{name:/All work/}).click();
  assert.equal(await page.locator('#filter-status').textContent(),'5 projects');
  checks.push('project filters, exact counts and selected state');
  assert.equal(await page.getByRole('tab').count(),4);
  assert.equal(await page.getByRole('tabpanel').count(),1);
  for(const name of ['01 Products','02 Team','03 Projects','04 Documents']) {
    await page.getByRole('tab',{name,exact:true}).click();
    assert.equal(await page.getByRole('tab',{name,exact:true}).getAttribute('aria-selected'),'true');
    assert.equal(await page.getByRole('tabpanel').count(),1);
  }
  assert.match(await page.getByRole('tabpanel').innerText(),/Live converter · real imports checked/);
  await page.getByRole('tab',{name:'04 Documents'}).press('ArrowRight');
  assert.equal(await page.getByRole('tab',{name:'01 Products'}).getAttribute('aria-selected'),'true');
  await page.getByRole('tab',{name:'01 Products'}).press('End');
  assert.equal(await page.getByRole('tab',{name:'04 Documents'}).getAttribute('aria-selected'),'true');
  await page.getByRole('tab',{name:'04 Documents'}).press('Home');
  assert.equal(await page.getByRole('tab',{name:'01 Products'}).getAttribute('aria-selected'),'true');
  checks.push('four system modules, honest status, one visible panel and keyboard arrow/Home/End navigation');
  const summary=page.locator('.build-notes summary').first();
  await summary.focus(); await page.keyboard.press('Enter');
  assert.equal(await page.locator('.build-notes').first().getAttribute('open'),'');
  assert.equal(await page.getByRole('heading',{name:'The implementation',exact:true}).first().isVisible(),true);
  await summary.press('Enter');
  checks.push('keyboard-operable expandable build notes');
  await page.getByRole('button',{name:/Copy email/}).click();
  assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),'basitshahab24904@gmail.com');
  assert.equal(await page.locator('#copy-status').textContent(),'Email address copied.');
  await page.evaluate(()=>Object.defineProperty(navigator.clipboard,'writeText',{value:async()=>{throw Error('permission denied');}}));
  await page.getByRole('button',{name:/Copied/}).click();
  assert.match(await page.locator('#copy-status').textContent(),/Copy is unavailable/);
  checks.push('email copying and denied-clipboard fallback');
  await page.getByRole('link',{name:'Back to top',exact:true}).click();
  assert.equal(new URL(page.url()).hash,'#top');
  for(const width of [1440,768,390]) {
    await page.setViewportSize({width,height:1000});
    await page.evaluate(()=>scrollTo(0,0));
    await page.waitForTimeout(400);
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`overflow${width}`);
    await page.screenshot({path:new URL(`../qa/${width}-top.png`,import.meta.url).pathname.replace(/^\/([A-Z]:)/,'$1')});
    await page.screenshot({path:new URL(`../qa/${width}.png`,import.meta.url).pathname.replace(/^\/([A-Z]:)/,'$1'),fullPage:true});
    await page.locator('#luxgear').screenshot({path:new URL(`../qa/flagship-${width}.png`,import.meta.url).pathname.replace(/^\/([A-Z]:)/,'$1')});
    const height=await page.locator('#luxgear').evaluate(el=>el.getBoundingClientRect().height);
    for(const tab of await page.getByRole('tab').all()) {
      assert.ok(await tab.evaluate(el=>el.getBoundingClientRect().height>=44),'Tab touch height');
      await tab.click();
      assert.equal(await page.getByRole('tabpanel').count(),1);
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`module overflow ${width}`);
      assert.ok(Math.abs((await page.locator('#luxgear').evaluate(el=>el.getBoundingClientRect().height))-height)<2,`module height shift ${width}`);
    }
    await page.getByRole('tab',{name:'01 Products'}).click();
  }
  await page.emulateMedia({reducedMotion:'reduce'});
  assert.equal(await page.evaluate(()=>getComputedStyle(document.documentElement).scrollBehavior),'auto');
  await page.screenshot({path:new URL('../qa/reduced-motion.png',import.meta.url).pathname.replace(/^\/([A-Z]:)/,'$1'),fullPage:true});
  checks.push('390/768/1440 responsive layouts and reduced motion');
  for(const width of [320,360,1920]) {
    await page.setViewportSize({width,height:1000});
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`additional overflow ${width}`);
    assert.ok(await page.locator('h1').evaluate(el=>el.scrollWidth<=el.clientWidth+1),`headline clipping ${width}`);
  }
  assert.equal(requests.some(url=>!url.startsWith(origin)),false,'No third-party runtime requests');
  assert.deepEqual(errors,[]);
  const plain=await browser.newPage({javaScriptEnabled:false,viewport:{width:390,height:900}});
  await plain.goto(origin);
  assert.equal(await plain.locator('.project').count(),5);
  assert.equal(await plain.locator('.work-tools').isVisible(),false);
  await plain.locator('.build-notes summary').first().click();
  assert.equal(await plain.getByRole('heading',{name:'The job',exact:true}).first().isVisible(),true);
  assert.equal(await plain.locator('a.email-link').getAttribute('href'),'mailto:basitshahab24904@gmail.com');
  assert.equal(await plain.locator('[data-system-tabs]').isVisible(),false);
  assert.equal(await plain.locator('[data-system-panel]:visible').count(),4);
  checks.push('no-JavaScript content, contact and build notes');
  await page.goto(origin);
  await page.getByRole('link',{name:'Read the system case study'}).click();
  assert.equal(new URL(page.url()).pathname,'/luxgear.html');
  assert.equal(await page.locator('h1').count(),1);
  for(const id of ['conversion-title','product-title','team-title','enquiry-title','analysis-title','progress-title']) {
    assert.equal(await page.locator(`#${id}`).count(),1);
  }
  assert.match(await page.locator('.case-progress').innerText(),/Live · real accounting imports checked/);
  assert.match(await page.locator('.case-progress').innerText(),/real locked-phone receipt is not yet verified/);
  assert.match(await page.locator('.case-progress').innerText(),/Planned · not autonomous today/);
  assert.match(await page.locator('.case-progress').innerText(),/DWG-to-BOQ/);
  assert.match(await page.locator('#analysis-title').locator('..').innerText(),/3,069/);
  assert.match(await page.locator('#analysis-title').locator('..').innerText(),/1,574/);
  assert.doesNotMatch(await page.locator('body').innerText(),/\bAED\b|US\$|@luxgear\.ae|sk-ant-|sb_secret_/);
  assert.equal(await page.locator('meta[name="robots"]').getAttribute('content'),'noindex, nofollow');
  for(const width of [1440,768,390]) {
    await page.setViewportSize({width,height:1000});
    await page.evaluate(()=>scrollTo(0,0));
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`case overflow ${width}`);
    await page.screenshot({path:new URL(`../qa/luxgear-${width}.png`,import.meta.url).pathname.replace(/^\/([A-Z]:)/,'$1'),fullPage:true});
    if(width===390)await page.locator('.product-flow').screenshot({path:new URL('../qa/luxgear-flow.png',import.meta.url).pathname.replace(/^\/([A-Z]:)/,'$1')});
  }
  await page.getByRole('link',{name:'Back to selected work'}).click();
  assert.equal(new URL(page.url()).hash,'#luxgear');
  await plain.goto(`${origin}/luxgear.html`);
  assert.equal(await plain.locator('.delivery-list>div').count(),6);
  for(const link of await plain.locator('a[href]').all()) {
    const target=await link.getAttribute('href');
    if(target.startsWith('http')||target.startsWith('mailto:'))continue;
    const url=new URL(target,plain.url());
    assert.equal((await context.request.get(url.href)).status(),200);
    if(url.hash){
      const html=await context.request.get(url.href);
      assert.ok((await html.text()).includes(`id="${url.hash.slice(1)}"`),`Missing anchor ${url.hash}`);
    }
  }
  assert.equal(requests.some(url=>!url.startsWith(origin)),false);
  assert.deepEqual(errors,[]);
  checks.push('Lux Gear case-study navigation, live/development boundaries, local links, no-JS and responsive layouts');
  const result={checkedOn:'2026-10-28',checks,pageErrors:errors,thirdPartyRequests:0,published:false};
  await writeFile(new URL('../qa/verification.json',import.meta.url),JSON.stringify(result,null,2));
  console.log(JSON.stringify(result));
}catch(error){await page.screenshot({path:new URL('../qa/failure.png',import.meta.url).pathname.replace(/^\/([A-Z]:)/,'$1'),fullPage:true});throw error;}
finally{await browser.close();}
