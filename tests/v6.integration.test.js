const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
test('social scenes animate before the ending card appears',()=>{
 assert.match(read('game.js'),/Social\.draw\(ctx,\{ending,time:elapsed/);
 assert.match(read('game.js'),/Social\.durationFor\(ending\)/);
});
test('characters have pixel portraits and untimed four-choice menus',()=>{
 assert.match(read('index.html'),/id="speaker-portrait"/);
 assert.match(read('game.js'),/function drawSpeakerPortrait\(/);
 assert.match(read('game.js'),/choiceButtons\[Number\(k\)-1\]/);
 assert.doesNotMatch(read('index.html'),/decision-timer/);
});
test('three satirical social meme endings are distinct',()=>{
 for(const s of ['CAPTAIN CROSSWALK','HERO SPEECH','GRANDMA MODE'])assert.ok(read('social.js').includes(s));
 assert.match(read('music.js'),/kind==='mock'/);
});
