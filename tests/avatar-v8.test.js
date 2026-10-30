const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const Art=require('../gba-art');
const game=fs.readFileSync(path.join(root,'game.js'),'utf8');
const style=fs.readFileSync(path.join(root,'styles.css'),'utf8');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
test('four distinct selectable avatars including non-binary and otter',()=>{
 assert.deepEqual(Object.keys(Art.AVATARS),['boy','girl','nonbinary','otter']);
 assert.match(game,/data-action="choose-avatar"/);
 assert.match(game,/selectedAvatar=key;start\(\)/);
 assert.match(game,/showOverlay\('avatar'\)/);
});
test('selected avatar propagates into GBA sprite renderer',()=>{
 assert.match(game,/avatar:selectedAvatar/);
 assert.match(fs.readFileSync(path.join(root,'gba-art.js'),'utf8'),/function drawOtterSprite/);
});
test('dialogue remains scrollable and options are accessible without full screen',()=>{
 assert.match(style,/\.dialogue\{[\s\S]*?max-height:calc\(100% - 62px\)/);
 assert.match(style,/overflow-x:hidden;overflow-y:auto/);
 assert.match(style,/\.dialogue-actions\{grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
 assert.match(game,/choiceButtons\[Number\(k\)-1\]/);
});
test('assets are cache versioned and gameplay keeps untimed decisions',()=>{
 for(const name of ['logic.js','music.js','cinematics.js','social.js','gba-art.js','pixel-snow.js','game.js'])assert.ok(html.includes(name+'?v=8'),name);
 assert.ok(html.includes('styles.css?v=8'));
 assert.doesNotMatch(html,/decision-timer/);
});
