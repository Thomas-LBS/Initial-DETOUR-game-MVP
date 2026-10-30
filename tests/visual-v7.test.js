const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const art=require('../gba-art');
const snow=require('../pixel-snow');
const read=(name)=>fs.readFileSync(path.join(__dirname,'..',name),'utf8');
test('new sprites have four directions, moving and idle frames',()=>{
  assert.equal(art.normalizeDirection('up'),'up');
  assert.equal(art.normalizeDirection('left'),'left');
  assert.equal(art.normalizeDirection('not-a-direction'),'down');
  assert.deepEqual([0,.13,.26,.39].map(t=>art.walkFrame(t,true)),[0,1,2,3]);
  assert.deepEqual([0,.13,.26,.39].map(t=>art.walkFrame(t,false)),[0,0,0,0]);
});
test('GBA art renders all chapters using canvas-only primitives',()=>{
  let draws=0;
  const ctx={fillStyle:'#000',font:'',fillRect(){draws++},fillText(){draws++},save(){},restore(){},translate(){},rotate(){}};
  for(let chapter=0;chapter<3;chapter++)art.drawScene(ctx,{chapter,time:2.6,phase:'explore'});
  art.drawSprite(ctx,{x:8,y:11,face:'down',moving:true,time:2,variant:'player'});
  art.drawSprite(ctx,{x:8,y:11,face:'left',moving:true,time:2});
  art.drawSprite(ctx,{x:8,y:11,face:'up',moving:false,time:2});
  art.drawSprite(ctx,{x:8,y:11,face:'right',moving:true,time:2});
  assert.ok(draws>250,`Expected substantial decorative detail, got ${draws}`);
});
test('snow particle counts are bounded for mobile and desktop',()=>{
  assert.equal(snow.countFor(360),24);
  assert.equal(snow.countFor(768),38);
  assert.equal(snow.countFor(1440),62);
});
test('merge effect only applies to genuinely nearby particles',()=>{
  assert.equal(snow.near({x:0,y:0,size:1},{x:2,y:2,size:1}),true);
  assert.equal(snow.near({x:0,y:0,size:1},{x:200,y:200,size:1}),false);
  const p=snow.particle(4,1000,700);
  assert.ok(p.x>=0&&p.x<=1000&&p.y>=0&&p.y<=700);
});
test('page contains a noninteractive animated background and new versioned artwork modules',()=>{
  const html=read('index.html'),css=read('styles.css'),game=read('game.js');
  assert.match(html,/id="pixel-snow"/);
  assert.match(html,/pixel-snow\.js\?v=9/);
  assert.match(html,/gba-art\.js\?v=9/);
  assert.match(css,/#pixel-snow\{[^}]*pointer-events:none/);
  assert.match(game,/Art\.drawSprite/);
  assert.match(game,/Art\.drawScene/);
  assert.doesNotMatch(html,/decision-timer/);
});