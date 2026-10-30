/* DETOUR chapter data and pure game rules. Browser + Node compatible. */
(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.DetourLogic=api;
})(typeof window!=='undefined'?window:undefined,function(){
  'use strict';
  const COLS=30,ROWS=20,TILE=16;
  const CHOICES=Object.freeze({FOLLOW:'follow',CROSS:'cross',TOGETHER:'together',CONFRONT:'confront'});
  // Every chapter offers four distinct experiences: individual safety, cooperation,
  // social fallout, and physical or social danger. There are no timed decisions.
  const CHAPTERS=Object.freeze([
    Object.freeze({id:'shortcut',title:'The Shortcut',location:'WESTSIDE',quest:'Meet Lucas by the school gates',prompt:'Lucas wants to cross the road away from the marked crossing.',theme:'streets',music:'street',target:{x:12,y:11},options:['cross','together','confront','follow']}),
    Object.freeze({id:'photo',title:'The Humiliating Photo',location:'SCHOOLYARD',quest:'Find the group near the courtyard',prompt:'Someone wants you to forward a humiliating photo of Amine.',theme:'courtyard',music:'social',target:{x:12,y:11},options:['report','support','challenge','share']}),
    Object.freeze({id:'rooftop',title:'The Rooftop Dare',location:'WESTSIDE PLAZA',quest:'Talk to your friends near the old building',prompt:'Your friends want to climb a closed structure for a photo.',theme:'plaza',music:'danger',target:{x:12,y:11},options:['stay','alternative','leave','climb']})
  ]);
  const OUTCOMES=Object.freeze({
    shortcut:Object.freeze({cross:'safe-arrival',together:'group-crossing',confront:'mocked',follow:'collision'}),
    photo:Object.freeze({report:'reported',support:'supported',challenge:'excluded',share:'spread'}),
    rooftop:Object.freeze({stay:'boundary',alternative:'alternative',leave:'ridiculed',climb:'fall'})
  });
  const COOPERATIVE=Object.freeze(new Set(['group-crossing','supported','alternative']));
  const SOCIAL=Object.freeze(new Set(['mocked','excluded','ridiculed']));
  const CRITICAL=Object.freeze(new Set(['collision','spread','fall']));
  function chapter(index){return CHAPTERS[Math.max(0,Math.min(CHAPTERS.length-1,index))];}
  function outcomeFor(chapterId,choice){return OUTCOMES[chapterId]?.[choice]??null;}
  function outcomeKind(outcome){if(CRITICAL.has(outcome))return'danger';if(SOCIAL.has(outcome))return'social';if(COOPERATIVE.has(outcome))return'cooperative';return Object.values(OUTCOMES).some(group=>Object.values(group).includes(outcome))?'safe':null;}
  function isCritical(outcome){return CRITICAL.has(outcome);}
  function canWalk(x,y,chapterIndex=0){
    if(!Number.isInteger(x)||!Number.isInteger(y)||x<1||x>28||y<1||y>18)return false;
    if(chapterIndex===0)return !(
      (x>=2&&x<=10&&y>=3&&y<=8)||
      (x>=22&&x<=28&&y>=2&&y<=5)||
      (x>=2&&x<=8&&y>=16&&y<=18)||
      (x>=22&&x<=28&&y>=16&&y<=18)||
      (x>=15&&x<=18)
    );
    if(chapterIndex===1)return !(
      (x>=2&&x<=9&&y>=2&&y<=7)||
      (x>=21&&x<=28&&y>=2&&y<=7)||
      (x>=22&&x<=28&&y>=15&&y<=18)
    );
    return !(
      (x>=1&&x<=9&&y>=2&&y<=7)||
      (x>=21&&x<=28&&y>=2&&y<=8)||
      (x>=20&&x<=28&&y>=15&&y<=18)
    );
  }
  function inRange(player,point,range=2){return Math.abs(player.x-point.x)+Math.abs(player.y-point.y)<=range;}
  function consequence(choice){return outcomeFor('shortcut',choice);}
  function nextPhase(phase,event){
    if(phase==='title'&&event==='start')return'explore';
    if(phase==='explore'&&event==='talk')return'decision';
    if(phase==='decision'&&event==='follow')return'danger';
    if(phase==='decision'&&event==='cross')return'safe';
    if(phase==='decision'&&event==='together')return'cooperative';
    if(phase==='decision'&&event==='confront')return'social';
    if(phase==='danger'&&event==='impact')return'gameover';
    if(['safe','cooperative','social'].includes(phase)&&event==='arrived')return'complete';
    if(['gameover','complete'].includes(phase)&&event==='retry')return'decision';
    return phase;
  }
  return {COLS,ROWS,TILE,CHOICES,CHAPTERS,chapter,outcomeFor,outcomeKind,isCritical,canWalk,inRange,consequence,nextPhase};
});