/* DETOUR v6. Original pixel-art group-chat cutscenes. The target of bullying is never the joke. */
(function(root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.DetourSocial = api;
})(typeof window !== 'undefined' ? window : undefined, function() {
  'use strict';

  const STORIES = Object.freeze({
    mocked: Object.freeze({
      sender: 'LUCAS', caption: 'CAPTAIN CROSSWALK', sticker: 'SAFETY FIRST?', chatStatus: 'YOU WERE MUTED',
      jokes: ['CROSSWALK KING', 'ROAD MONITOR', 'SIR STOP SIGN'],
      reply: 'MAYA: THAT WAS NOT COOL.',
      takeaway: 'THEIR MEME IS NOT YOUR FAULT.'
    }),
    excluded: Object.freeze({
      sender: 'LUCAS', caption: 'HERO SPEECH', sticker: 'CLASS POLICE', chatStatus: 'YOU WERE REMOVED',
      jokes: ['GIVE HIM A MEDAL', 'NO FUN ALLOWED', 'MIC DROP'],
      reply: 'MAYA: THANKS FOR SPEAKING UP.',
      takeaway: 'SPEAKING UP WAS NOT THE PROBLEM.'
    }),
    ridiculed: Object.freeze({
      sender: 'NOAH', caption: 'GRANDMA MODE', sticker: 'PAJAMA SPEEDRUN', chatStatus: 'GROUP CHAT: 12 NEW JOKES',
      jokes: ['ALREADY IN BED?', 'BRO LEFT THE SQUAD', 'NIGHT NIGHT'],
      reply: 'LINA: THEY ARE BEING CHILDISH.',
      takeaway: 'YOUR BOUNDARY STILL COUNTS.'
    })
  });
  const DURATION = 6.3;
  const stages = Object.freeze(['setup', 'meme', 'notifications', 'perspective']);
  const isSocialEnding = key => Object.prototype.hasOwnProperty.call(STORIES, key);
  const durationFor = key => isSocialEnding(key) ? DURATION : 3.2;
  function stageFor(ending, time) {
    if (!isSocialEnding(ending)) return 'none';
    if (time < 0.85) return 'setup';
    if (time < 2.5) return 'meme';
    if (time < 4.2) return 'notifications';
    return 'perspective';
  }
  const rect = (ctx,x,y,w,h,color) => { ctx.fillStyle=color; ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h)); };
  function type(ctx,string,x,y,color='#FFF6DE',size=12,align='center') {
    ctx.font = '900 '+size+'px monospace'; ctx.textAlign=align;
    ctx.fillStyle='#142238'; ctx.fillText(string,x+1,y+1);
    ctx.fillStyle=color; ctx.fillText(string,x,y);
  }
  function phone(ctx,x,y) {
    rect(ctx,x-88,y-117,176,236,'#0B1426'); rect(ctx,x-83,y-113,166,226,'#2C2441');
    rect(ctx,x-75,y-100,150,190,'#F3E6D4');
    rect(ctx,x-16,y+99,32,5,'#847095');
  }
  function fakeMeme(ctx,x,y,story) {
    rect(ctx,x-64,y-71,128,146,'#F8E6C7');
    rect(ctx,x-60,y-67,120,108,'#A5CDB6');
    // Original all-ages, clothed character caricature drawn directly in pixel art.
    rect(ctx,x-12,y-40,24,26,'#443447'); // hair
    rect(ctx,x-10,y-34,20,23,'#F0BF99');
    rect(ctx,x-5,y-25,3,3,'#223245'); rect(ctx,x+5,y-25,3,3,'#223245');
    rect(ctx,x-27,y-10,54,43,story.sender==='NOAH'?'#B79BCB':'#E1B95C');
    rect(ctx,x-8,y-8,16,34,story.sender==='NOAH'?'#D5AFDB':'#F6DE91');
    if (story.caption==='CAPTAIN CROSSWALK') {rect(ctx,x-20,y+2,40,7,'#FAF2C9');rect(ctx,x-14,y+2,7,7,'#E57977');rect(ctx,x+9,y+2,7,7,'#E57977');}
    if (story.caption==='HERO SPEECH') {rect(ctx,x+26,y+2,24,11,'#3D405A');rect(ctx,x+47,y+5,7,4,'#3D405A');}
    if (story.caption==='GRANDMA MODE') {rect(ctx,x-28,y+21,56,12,'#B596D1');rect(ctx,x+17,y-35,15,6,'#D3B6E1');}
    rect(ctx,x-60,y+45,120,26,'#23182F');type(ctx,story.caption,x,y+61,'#FFE5A9',story.caption.length>17?9:11);
  }
  function chat(ctx,x,y,string,color='#E6D5F1') {
    rect(ctx,x+3,y+3,186,30,'#160F22aa');
    rect(ctx,x,y,186,30,color);
    type(ctx,string,x+93,y+20,'#2E2340',string.length>20?9:10);
  }
  function draw(ctx,{ending,time,width=480,height=320,reducedMotion=false}={}) {
    if (!isSocialEnding(ending)) return;
    const story=STORIES[ending], stage=stageFor(ending,time);
    ctx.save();
    rect(ctx,0,0,width,height,'#170E29e8');
    if (stage==='setup') {
      rect(ctx,38,83,404,132,'#38264D');
      type(ctx,story.sender+' IS TYPING...',240,135,'#FFE5B3',16);
      type(ctx,'...',240,171,'#E8D5EF',22);
    } else if (stage==='meme') {
      phone(ctx,240,160);fakeMeme(ctx,240,159,story);
      type(ctx,'NEW MESSAGE FROM '+story.sender,240,26,'#FFE1A8',11);
      type(ctx,story.sticker,240,303,'#EBD8F8',12);
    } else if (stage==='notifications') {
      rect(ctx,0,0,width,height,'#36264F');
      const t=Math.max(0,time-2.5);
      for(let i=0;i<7;i++) {
        const dy=reducedMotion?0:Math.sin(t*7+i*1.7)*3;
        chat(ctx,(i%2?252:31),28+Math.floor(i/2)*68+dy,story.jokes[i%3],i%2?'#E5D3F3':'#F3DBA8');
      }
      type(ctx,'12 NEW NOTIFICATIONS',240,307,'#F9DFAC',15);
    } else {
      rect(ctx,30,46,420,237,'#302242');
      rect(ctx,42,57,396,35,'#4C3469');
      type(ctx,'CLASS GROUP CHAT',240,80,'#FBE1AA',16);
      chat(ctx,63,108,story.chatStatus, '#E2C2CA');
      rect(ctx,59,154,363,45,'#523D69');
      type(ctx,story.reply,240,182,'#F5E9D8',11);
      type(ctx,story.takeaway,240,254,'#FFDDB8',12);
      type(ctx,'THE GROUP GOT LOUD. YOUR CHOICE STILL MATTERS.',240,300,'#C8B8D3',9);
    }
    ctx.restore();
  }
  return {STORIES,stages,isSocialEnding,durationFor,stageFor,draw};
});