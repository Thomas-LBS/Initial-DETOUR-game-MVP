import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { resolve, extname, join } from 'node:path';
import { chromium } from 'playwright-core';

const root = resolve(import.meta.dirname, '..');
const screenshots = join(root, 'browser-qa');
await mkdir(screenshots, { recursive: true });
const types = {'.html':'text/html','.css':'text/css','.js':'text/javascript','.png':'image/png','.svg':'image/svg+xml'};
const server = createServer(async (req,res)=>{
  try {
    const url = new URL(req.url, 'http://localhost');
    const pathname = decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname);
    const file = resolve(root, '.'+pathname);
    if(!(file === root || file.startsWith(root+'/'))) {res.writeHead(403);res.end();return;}
    const data = await readFile(file);
    res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream'});
    res.end(data);
  } catch (e) {res.writeHead(404);res.end('Not found');}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin = 'http://127.0.0.1:' + server.address().port;
let browser;
try {
  browser = await chromium.launch({channel:'chrome',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
  for(const viewport of [{width:1366,height:768},{width:1024,height:600},{width:390,height:844}]){
    const page = await browser.newPage({ viewport, deviceScaleFactor:1, reducedMotion:'reduce'});
    const errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    await page.goto(origin,{waitUntil:'domcontentloaded'});
    await page.locator('[data-action="start"]').click();
    assert.equal(await page.locator('.avatar-option').count(),4,'avatar options');
    await page.locator('.avatar-option[data-avatar="otter"]').click();
    assert.equal(await page.locator('#screen-overlay').evaluate(x=>x.innerHTML.trim()),'','game started after avatar selection');
    assert.ok(await page.evaluate(()=>!!window.DetourArt.AVATARS.otter),'otter sprite registered');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('e');
    await page.locator('#dialogue:not(.hidden)').waitFor({timeout:3500});
    assert.equal(await page.locator('.choice-btn').count(),4,'four answers present');
    const metrics=await page.evaluate(()=>{
      const s=document.getElementById('screen-wrap').getBoundingClientRect();
      const d=document.getElementById('dialogue');
      const rect=d.getBoundingClientRect();
      const style=getComputedStyle(d);
      return {screenTop:s.top,screenBottom:s.bottom,dialogueTop:rect.top,dialogueBottom:rect.bottom,
        overflowY:style.overflowY,visibleHeight:d.clientHeight,totalHeight:d.scrollHeight,
        choices:[...d.querySelectorAll('.choice-btn')].map(c=>{const r=c.getBoundingClientRect();return {top:r.top,bottom:r.bottom};})};
    });
    assert.ok(metrics.dialogueTop>=metrics.screenTop-2,JSON.stringify(metrics));
    assert.ok(metrics.dialogueBottom<=metrics.screenBottom+2,JSON.stringify(metrics));
    assert.equal(metrics.overflowY,'auto');
    await page.locator('.choice-btn').last().scrollIntoViewIfNeeded();
    await page.locator('.choice-btn').last().click();
    await page.screenshot({path:join(screenshots,viewport.width+'x'+viewport.height+'.png')});
    assert.deepEqual(errors,[],'runtime errors: '+errors.join(', '));
    console.log('PASS '+viewport.width+'x'+viewport.height+' dialogue / avatar / movement / answer');
    await page.close();
  }
}finally{
 if(browser)await browser.close();
 await new Promise(resolve=>server.close(resolve));
}