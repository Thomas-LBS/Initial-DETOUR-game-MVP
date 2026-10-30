(() => {
  'use strict';
  const L=window.DetourLogic;
  const music=window.DetourMusic;
  const canvas=document.getElementById('game-canvas');
  const ctx=canvas.getContext('2d',{alpha:false});
  if(!ctx){document.getElementById('screen-overlay').textContent='Your browser does not support Canvas.';return;}
  ctx.imageSmoothingEnabled=false;
  const T=16,W=480,H=320;
  const overlay=document.getElementById('screen-overlay');
  const dialogue=document.getElementById('dialogue');
  const speakerEl=document.getElementById('speaker');
  const dialogueText=document.getElementById('dialogue-text');
  const actionsEl=document.getElementById('dialogue-actions');
  const timerEl=document.getElementById('decision-timer');
  const timerNumber=document.getElementById('timer-number');
  const timerFill=document.getElementById('timer-fill');
  const pauseBtn=document.getElementById('pause-btn');
  const fieldNote=document.getElementById('field-note');
  const statusEl=document.getElementById('status-line');
  const sceneLabel=document.getElementById('scene-label');
  const questTitle=document.getElementById('quest-title');
  const questDetail=document.getElementById('quest-detail');
  const chapterNumber=document.getElementById('chapter-number');
  const toast=document.getElementById('scene-toast');
  const keys=new Set();
  let chapterIndex=0,phase='title',dialogueOpen=false,player={x:8,y:11,dir:'down'},lucas={x:12,y:11},maya={x:11,y:10};
  let elapsed=0,last=0,nextMove=0,busY=-5,seenMaya=false,noticedRoad=false,screenShake=0,impactFlash=0,hasReached=false;
  let ending=null,wasTimeout=false,decisionLeft=L.DECISION_SECONDS,decisionActive=false,decisionPaused=false,choiceButtons=[];
  const pal={grass:'#88b47b',grass2:'#7eaa77',leaf:'#447e61',leaf2:'#66a577',dark:'#294a52',light:'#ecf2cc',stone:'#cccdb2',pave:'#e4dfc4',road:'#566871',edge:'#384e5c',cream:'#f8efcc',water:'#87c7c3',yellow:'#ebbe68',brick:'#bb866c',roof:'#be765d',shadow:'#274e5580'};
  const rand=(x,y)=>((x*73856093^y*19349663)>>>0)%100;
  const px=(x,y,w,h,col)=>{ctx.fillStyle=col;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));};
  const tile=(x,y,col)=>px(x*T,y*T,T,T,col);
  function label(text,x,y,col='#e9f7d5',size=8){ctx.font=`bold ${size}px monospace`;ctx.textAlign='center';ctx.fillStyle='#243c44';ctx.fillText(text,x+1,y+1);ctx.fillStyle=col;ctx.fillText(text,x,y);}
  function current(){return L.chapter(chapterIndex);}
  function showToast(text){toast.textContent=text;toast.classList.toggle('hidden',!text);}
  function setPhase(p){phase=p;elapsed=0;nextMove=0;updateJournal();}
  function clearTimer(){decisionActive=false;decisionPaused=false;timerEl.classList.add('hidden');timerEl.setAttribute('aria-hidden','true');pauseBtn.textContent='Ⅱ PAUSE';}
  function renderTimer(){
    const seconds=Math.max(0,Math.ceil(decisionLeft));
    timerNumber.textContent=String(seconds).padStart(2,'0');
    timerFill.style.width=`${Math.max(0,decisionLeft)/L.DECISION_SECONDS*100}%`;
    timerEl.classList.toggle('urgent',decisionLeft<=3);
    timerEl.classList.toggle('paused',decisionPaused);
    pauseBtn.textContent=decisionPaused?'▶ RESUME':'Ⅱ PAUSE';
    pauseBtn.setAttribute('aria-pressed',String(decisionPaused));
    pauseBtn.setAttribute('aria-label',decisionPaused?'Resume 10-second decision timer':'Pause 10-second decision timer');
  }
  function beginTimer(){decisionLeft=L.DECISION_SECONDS;decisionActive=true;decisionPaused=false;timerEl.classList.remove('hidden');timerEl.setAttribute('aria-hidden','false');renderTimer();music.setTension(.4);}
  function pauseTimer(force){if(!decisionActive)return;decisionPaused=typeof force==='boolean'?force:!decisionPaused;renderTimer();if(decisionPaused)music.stop();else music.start();}
  function openDialogue(name,text,choices,{timed=false,dark=false}={}){
    clearTimer();dialogueOpen=true;speakerEl.textContent=name;dialogueText.textContent=text;actionsEl.replaceChildren();choiceButtons=[];
    dialogue.classList.toggle('dark',dark);
    choices.forEach((c,i)=>{const btn=document.createElement('button');btn.className='choice-btn'+(c.primary?' primary':'');btn.textContent=`${i+1}. ${c.text}`;
      btn.addEventListener('click',()=>{if(!dialogueOpen)return;music.effect('click');c.onClick();});actionsEl.appendChild(btn);choiceButtons.push(btn);});
    dialogue.classList.remove('hidden');
    if(timed)beginTimer();
  }
  function closeDialogue(){clearTimer();dialogueOpen=false;dialogue.classList.add('hidden');actionsEl.replaceChildren();choiceButtons=[];}
  function setChapter(idx){
    chapterIndex=Math.max(0,Math.min(L.CHAPTERS.length-1,idx));
    player={x:8,y:11,dir:'down'};lucas={x:12,y:11};maya={x:11,y:10};
    seenMaya=false;noticedRoad=false;hasReached=false;ending=null;wasTimeout=false;busY=-5;impactFlash=0;screenShake=0;
    closeDialogue();overlay.innerHTML='';showToast('');
    music.setTrack(current().music);
    updateJournal();
  }
  const overlayTemplates={
    title:()=>`<div class="overlay-card dark-bubble"><span class="tiny">✳ DETOUR / THREE CHAPTERS</span><h3>DETOUR<span style="color:#e9b879">.</span></h3><p>Explore Westside, make your own choices, and see what happens next. You have <strong>10 seconds</strong> when the pressure is on. You can pause the timer at any point.</p><div class="buttons"><button class="pixel-btn" data-action="start">▶ START ADVENTURE</button></div></div>`,
    gameover:()=>{
      const messages=[
        wasTimeout?"While you hesitate, Lucas steps forward and you instinctively follow. A school bus strikes your character. The scene cuts before showing injuries.":"You follow Lucas into the road. A school bus strikes your character. The scene cuts before showing injuries.",
        wasTimeout?"No one intervenes before the photo is forwarded by someone else. Amine is upset and asks for help. The people sharing the image are responsible for their actions.":"The photo spreads beyond the group. Amine is humiliated and trust is damaged. The people who shared it are responsible for that harm.",
        wasTimeout?"The group moves ahead before anyone suggests another plan. Someone slips while climbing and an adult calls for help. You are not responsible for other people's actions.":"A friend loses their footing during the climb. The scene cuts away as others call for help. One possibility, not an inevitable outcome."
      ];
      const lessons=["WHAT OTHER ROUTE COULD YOU TAKE?","HOW COULD YOU SUPPORT THE PERSON TARGETED?","HOW COULD YOU SET A BOUNDARY OR OFFER AN ALTERNATIVE?"];
      return `<div class="overlay-card dark-bubble"><span class="tiny" style="color:#f0c3ac">✱ ${wasTimeout?'TIME RAN OUT':'A DIFFICULT OUTCOME'}</span><h3>${chapterIndex===1?'THE PHOTO SPREADS':chapterIndex===2?'AN ACCIDENT':'GAME OVER'}</h3><p>${messages[chapterIndex]}</p><p class="ending-stat">${lessons[chapterIndex]}</p><div class="buttons"><button class="pixel-btn" data-action="retry">↶ RETRY DECISION</button><button class="pixel-btn secondary" data-action="reset">RESTART</button></div></div>`;
    },
    complete:()=>{
      const messages=[
        'The group reaches the skatepark. Lucas grumbles, but you made a plan together. An alternative can keep the group moving.',
        ending==='boundary'?'Some friends call you dramatic for refusing. Maya quietly backs you up. Amine has room to ask for support. Setting a boundary can feel awkward.':'You check on Amine and bring the situation to a trusted adult. It may take time to resolve, but Amine knows someone cares.',
        ending==='boundary'?'You stay off the closed structure. A friend teases you, but you can keep your boundary without needing their approval.':'You suggest a ground-level shot with a dramatic angle. Some friends join you; others need more convincing. Nobody has to climb.'
      ];
      const isLast=chapterIndex===L.CHAPTERS.length-1;
      return `<div class="overlay-card dark-bubble"><span class="tiny">✳ CHAPTER ${String(chapterIndex+1).padStart(2,'0')} COMPLETE</span><h3>${isLast?'ADVENTURE COMPLETE!':'CHAPTER CLEARED!'}</h3><p>${messages[chapterIndex]}</p><p class="ending-stat">YOUR CHOICE WAS ONE POSSIBLE WAY FORWARD.</p><div class="buttons">${!isLast?'<button class="pixel-btn" data-action="next">▶ NEXT CHAPTER</button>':'<button class="pixel-btn" data-action="reset">↻ NEW ADVENTURE</button>'}<button class="pixel-btn secondary" data-action="retry">↶ REPLAY THIS CHOICE</button></div></div>`;
    }
  };
  function showOverlay(type){
    overlay.innerHTML=overlayTemplates[type]?.()||'';
    overlay.querySelectorAll('[data-action]').forEach(b=>b.addEventListener('click',()=>{
      const a=b.dataset.action;
      if(a==='start')start();else if(a==='retry')retry();else if(a==='reset')reset();else if(a==='next')nextChapter();
    }));
  }
  function updateJournal(){
    const data=current();
    document.querySelector('.edition').innerHTML=`PIXEL ADVENTURE <span class="edition-divider">/</span> CHAPTER ${String(chapterIndex+1).padStart(2,'0')}`;
    chapterNumber.textContent=`NO. ${String(chapterIndex+1).padStart(3,'0')}`;
    questTitle.textContent=data.title;
    questDetail.textContent=data.prompt;
    sceneLabel.textContent=`EPISODE ${String(chapterIndex+1).padStart(2,'0')}: ${data.title.toUpperCase()}`;
    const states={title:['active','',''],explore:['active','',''],decision:['done','active',''],danger:['done','done','active'],safe:['done','done','active'],gameover:['done','done','done'],complete:['done','done','done']};
    const state=states[phase]||states.explore;
    ['explore','decide','reflect'].forEach((id,i)=>{const el=document.getElementById('stage-'+id);el.className='quest-stage '+state[i];el.querySelector('.stage-check').textContent=state[i]==='done'?'✓':state[i]==='active'?'●':'○';});
    const notes={title:'Each chapter explores social pressure and safety. Every outcome is fictional, and you can always retry.',explore:'Explore the neighborhood. Use arrow keys/WASD to move and E or Space to talk to friends.',decision:'10 seconds to decide. Press 1, 2 or 3, or click an option. You can pause the timer.',danger:'Watch what unfolds. Consequences are one possible outcome, not a prediction.',safe:'Your choice changes the scene and how friends respond.',gameover:'A hard outcome is a chance to explore another response, not a judgment of you.',complete:'You completed this chapter. Try a different choice or move to the next scenario.'};
    fieldNote.textContent=notes[phase];
    statusEl.textContent={title:'PRESS START TO BEGIN YOUR DAY',explore:`EXPLORE · ${data.quest.toUpperCase()}`,decision:'DECIDE · YOU CAN PAUSE (P)',danger:'CONSEQUENCES UNFOLDING…',safe:'THE STORY CONTINUES…',gameover:'CHECKPOINT AVAILABLE · TRY AGAIN',complete:'CHAPTER CLEARED · CONTINUE OR REPLAY'}[phase];
  }
  function reset(){music.stop();setChapter(0);setPhase('title');showOverlay('title');}
  function start(){overlay.innerHTML='';setPhase('explore');music.start();music.effect('click');}
  function nextChapter(){music.stop();setChapter(chapterIndex+1);setPhase('explore');music.start();}
  function retry(){
    closeDialogue();overlay.innerHTML='';showToast('');busY=-5;impactFlash=0;screenShake=0;hasReached=false;ending=null;wasTimeout=false;
    player={x:13,y:11,dir:'right'};
    music.setTrack(current().music);music.start();openChallenge();
  }
  function openChallenge(){
    setPhase('decision');
    if(chapterIndex===0){
      const intro=seenMaya?"Lucas: 'The skatepark is right across the road. What do you think?'":"Lucas: 'Let's cut across the road! Everyone's waiting. Come on!'";
      openDialogue('LUCAS',intro,[
        {text:'Follow Lucas across',onClick:()=>resolve('follow')},
        {text:'Suggest the marked crossing',onClick:()=>resolve('cross'),primary:true},
        {text:'Ask Maya what she thinks',onClick:()=>askMaya()}
      ],{timed:true});
    }else if(chapterIndex===1){
      openDialogue('LUCAS',"'Look at this photo of Amine! Send it to the group. It's hilarious!' Maya looks uncomfortable.",[
        {text:'Forward the photo',onClick:()=>resolve('share')},
        {text:'Refuse and ask them to stop',onClick:()=>resolve('refuse'),primary:true},
        {text:'Check on Amine and seek help',onClick:()=>resolve('support')}
      ],{timed:true,dark:true});
    }else{
      openDialogue('NOAH',"'Climb up for the perfect photo!' Lina looks at the CLOSED sign. 'Are you sure?'",[
        {text:'Climb with the group',onClick:()=>resolve('climb')},
        {text:'Stay on the ground',onClick:()=>resolve('stay'),primary:true},
        {text:'Suggest a ground-level shot',onClick:()=>resolve('alternative')}
      ],{timed:true,dark:true});
    }
  }
  function askMaya(){seenMaya=true;noticedRoad=true;
    openDialogue('MAYA',"'That van blocks our view of traffic. There's a marked crossing further down. I wasn't sure how to say it.'",[
      {text:'Suggest the crossing together',onClick:()=>resolve('cross'),primary:true},
      {text:'Still follow Lucas',onClick:()=>resolve('follow')},
      {text:'Back to Lucas',onClick:()=>openChallenge()}
    ],{timed:true});
  }
  function resolve(choice,timedOut=false){
    const out=timedOut?L.timeoutOutcome(current().id):L.outcomeFor(current().id,choice);
    if(!out||out==='new-information')return;
    ending=out;wasTimeout=timedOut;
    closeDialogue();overlay.innerHTML='';hasReached=false;
    setPhase(L.isCritical(out)?'danger':'safe');
    music.setTension(L.isCritical(out)?1:0);
    if(timedOut){showToast(chapterIndex===0?'TIME UP! THE GROUP MOVES TOWARD THE ROAD…':chapterIndex===1?'TIME UP! SOMEONE ELSE SENDS THE PHOTO…':'TIME UP! THE GROUP CLIMBS WITHOUT A PLAN…');}
    else if(L.isCritical(out))showToast(chapterIndex===0?'LUCAS RUNS INTO THE ROAD…':chapterIndex===1?'THE IMAGE IS FORWARDED…':'THE GROUP STARTS CLIMBING…');
    else showToast(chapterIndex===0?'YOU SUGGEST THE MARKED CROSSING.':chapterIndex===1?'YOUR CHOICE CHANGES THE CONVERSATION.':'YOU CHOOSE YOUR OWN WAY FORWARD.');
  }
  function onDecisionTimeout(){if(!decisionActive||decisionPaused)return;resolve('timeout',true);}
  function interact(){
    if(phase==='title'){start();return;}
    if(dialogueOpen||['danger','safe','gameover','complete'].includes(phase))return;
    if(phase==='decision'){openChallenge();return;}
    const meeting=current().target;
    if(L.inRange(player,meeting,2)){openChallenge();return;}
    if(chapterIndex===0&&L.inRange(player,{x:11,y:10},2)){
      openDialogue('MAYA',"'I saw a school bus earlier. I wonder if we should use the proper crossing.'",[{text:'Thanks! Find Lucas',onClick:()=>{seenMaya=true;noticedRoad=true;closeDialogue();}}]);return;
    }
    if(chapterIndex===0&&L.inRange(player,{x:13,y:14},2)){
      noticedRoad=true;openDialogue('STREET SIGN','PEDESTRIAN CROSSING → 40 m. Traffic may be hidden by parked vehicles.',[{text:'Got it',onClick:closeDialogue}]);return;
    }
    openDialogue('EXPLORER',chapterIndex===0?'Find Lucas near the school gates.':'Find the group marked with an exclamation point.',[{text:'Continue exploring',onClick:closeDialogue}],{dark:chapterIndex>0});
  }
  function attemptMove(dx,dy){
    if(phase!=='explore'||dialogueOpen)return;
    const nx=player.x+dx,ny=player.y+dy;
    player.dir=dx>0?'right':dx<0?'left':dy<0?'up':'down';
    if(L.canWalk(nx,ny,chapterIndex)&&!(nx===lucas.x&&ny===lucas.y)&&!(chapterIndex===0&&nx===maya.x&&ny===maya.y)){player.x=nx;player.y=ny;}
    if(L.inRange(player,current().target,2))statusEl.textContent='NEAR FRIENDS · PRESS E TO TALK';
  }
  function keyToDir(k){return {arrowup:[0,-1],w:[0,-1],arrowdown:[0,1],s:[0,1],arrowleft:[-1,0],a:[-1,0],arrowright:[1,0],d:[1,0]}[k];}
  window.addEventListener('keydown',e=>{
    const k=e.key.toLowerCase();
    if(keyToDir(k)||[' ','e','r','p','1','2','3'].includes(k))e.preventDefault();
    if(k==='p'&&decisionActive){pauseTimer();return;}
    if(k==='r'&&!e.repeat){reset();return;}
    if(dialogueOpen&&['1','2','3'].includes(k)){choiceButtons[Number(k)-1]?.click();return;}
    if(k==='e'||k===' '){if(!e.repeat)interact();return;}
    if(keyToDir(k)){keys.add(k);if(!e.repeat){attemptMove(...keyToDir(k));nextMove=performance.now()+135;}}
  });
  window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
  window.addEventListener('blur',()=>{keys.clear();if(decisionActive)pauseTimer(true);});
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&decisionActive)pauseTimer(true);});
  const touchTimers=new Map();
  document.querySelectorAll('[data-dir]').forEach(b=>{
    const dirs={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]};const go=()=>attemptMove(...dirs[b.dataset.dir]);
    b.addEventListener('pointerdown',e=>{e.preventDefault();go();clearInterval(touchTimers.get(b));touchTimers.set(b,setInterval(go,150));b.setPointerCapture(e.pointerId);});
    const stop=()=>{clearInterval(touchTimers.get(b));touchTimers.delete(b);};
    b.addEventListener('pointerup',stop);b.addEventListener('pointercancel',stop);b.addEventListener('lostpointercapture',stop);
  });
  document.getElementById('touch-interact').addEventListener('click',interact);
  document.getElementById('restart-btn').addEventListener('click',reset);
  pauseBtn.addEventListener('click',()=>pauseTimer());
  document.getElementById('mute-btn').addEventListener('click',()=>{const enabled=music.toggle();const b=document.getElementById('mute-btn');b.textContent=enabled?'♫':'♪̸';b.setAttribute('aria-label',enabled?'Mute music':'Unmute music');b.title=enabled?'Mute music':'Unmute music';});
  // ALL ART BELOW IS DRAWN FROM CODE: original tiles, characters and vehicles, no copyrighted assets.
  function ground(){
    px(0,0,W,H,pal.grass);
    for(let y=0;y<20;y++)for(let x=0;x<30;x++){
      const r=rand(x,y);
      if(r<18){px(x*T+4,y*T+6,2,1,pal.grass2);px(x*T+11,y*T+10,2,1,'#9cc18a');}
      else if(r>92){px(x*T+7,y*T+7,2,2,'#e2d28f');}
    }
    // west and east pavements
    for(let y=0;y<20;y++)for(const x of [13,14,19,20]){
      tile(x,y,pal.pave);
      px(x*T,y*T,T,1,(y%2?'#c9c5ab':'#ded9bf'));
      px(x*T+(y%2?8:0),y*T,1,T,'#cecdb6');
    }
    // Road lanes and edges
    for(let y=0;y<20;y++)for(let x=15;x<=18;x++) tile(x,y,pal.road);
    px(15*T,0,2,H,'#e1d2a4');px(19*T-2,0,2,H,'#e1d2a4');
    for(let y=0;y<20;y+=3){px(17*T-1,y*T+6,2,17,'#c5cba8');}
    // Pedestrian crossing near south
    for(let y=14;y<=15;y++)for(let x=15;x<=18;x++){
      for(let i=0;i<3;i++)px(x*T+2+i*5,y*T+3,3,11,'#f8efcb');
    }
    // Paths to the school / skatepark
    for(let x=8;x<=13;x++)for(let y=10;y<=12;y++)tile(x,y,(x+y)%2===0?'#d8d3b6':'#ded9c2');
    for(let x=20;x<=26;x++)for(let y=12;y<=15;y++)tile(x,y,(x+y)%2===0?'#d8d3b6':'#dfdabe');
    // grass on pavement edges
    for(let y=0;y<20;y++) {px(12*T,y*T,1,T,'#739775');px(21*T,y*T,1,T,'#739775');}
  }
  function tree(cx,cy,scale=1){
    const x=Math.round(cx*T),y=Math.round(cy*T);const s=scale;
    px(x-1*s,y+2*s,4*s,8*s,'#705a46');
    px(x-9*s,y-7*s,19*s,13*s,'#315c50');px(x-12*s,y-4*s,25*s,10*s,'#477c5b');
    px(x-8*s,y-12*s,18*s,10*s,'#518e64');px(x-4*s,y-12*s,5*s,4*s,'#85b781');
  }
  function building(x,y,w,h,kind){
    const a=x*T,b=y*T,ww=w*T,hh=h*T;
    px(a+3,b+6,ww,hh-2,'#435a5c');px(a+1,b+4,ww,hh-3,kind==='school'?'#dfb68c':'#d7c5a4');
    // roof and brick texture
    px(a-3,b,ww+6,7,kind==='school'?pal.roof:'#6b8790');
    px(a-3,b+7,ww+6,2,'#654f52');
    for(let yy=b+13;yy<b+hh-8;yy+=11){for(let xx=a+5;xx<a+ww-6;xx+=17)px(xx+(yy%2?4:0),yy,5,1,'#be987d');}
    for(let xx=a+12;xx<a+ww-10;xx+=33){
      px(xx,b+19,19,18,'#596d73');px(xx+3,b+22,13,12,'#9fc8bb');px(xx+9,b+22,2,12,'#d5dccb');px(xx+3,b+27,13,2,'#d5dccb');
    }
    if(kind==='school'){
      px(a+ww/2-10,b+hh-26,20,26,'#334c58');px(a+ww/2-6,b+hh-21,12,16,'#91bcb7');
      px(a+ww/2-21,b+8,42,10,'#36585b');label('SCHOOL',a+ww/2,b+16,'#faf0c9',8);
    }
  }
  function streetObjects(time){
    // houses / school
    building(2,3,9,6,'school');building(22,2,7,4,'shop');building(2,16,7,4,'house');building(22,16,7,4,'house');
    label('WESTSIDE',376,53,'#fff1ca',7);
    // Trees edging the neighborhood
    [[1,2],[12,2],[1,10],[11,16],[21,2],[28,11],[22,18],[1,18],[10,18],[27,8]].forEach(([x,y])=>tree(x,y));
    // Skatepark: concrete pool and ramp
    px(22*T,7*T,7*T,5*T,'#427d70');px(23*T,8*T,5*T,3*T,'#a3c7b6');
    px(23*T+2,8*T+3,5*T-4,3*T-6,'#87b6a8');
    px(24*T,9*T+5,32,9,'#5d8797');px(24*T+2,9*T+7,28,5,'#9ab6bd');
    px(26*T+3,8*T+4,20,13,'#5e7b7b');px(26*T+5,8*T+4,17,3,'#c0d2bd');
    label('SKATEPARK',25*T,7*T+5,'#f5efc6',8);
    // bus shelter, benches and street lights
    px(21*T,2*T+4,31,2,'#335657');px(21*T+2,2*T+7,3,23,'#335657');px(21*T+28,2*T+7,3,23,'#335657');px(21*T+3,2*T+9,25,17,'#aad0bd');
    for(const [x,y] of [[12,4],[20,5],[12,17],[20,17]]){px(x*T+4,y*T+2,3,14,'#4d605d');px(x*T,y*T,12,4,'#e4d08c');}
    // Road warning sign on west side
    px(13*T+6,13*T+3,2,17,'#46615e');px(13*T+2,13*T,11,10,'#f1d494');px(13*T+4,13*T+2,7,6,'#566573');
    // parked van blocks visibility near the shortcut
    px(14*T+3,7*T+1,14,36,'#374f5a');px(14*T+5,7*T+3,10,31,'#d9c29e');px(14*T+5,7*T+5,10,7,'#a2c6c5');px(14*T+5,7*T+25,10,4,'#e7e2c1');
    // road markings and time hint
    px(18*T+1,4*T+6,5,2,'#e9e2b6');
    for(const [x,y] of [[3,12],[8,14],[25,13],[27,14],[9,2]]){
      px(x*T+3,y*T+6,2,3,'#d9d68f');px(x*T+6,y*T+2,2,2,'#f4d2ba');
    }
    // a small bicycle at skatepark
    drawBike(25*T+3,12*T-1);
  }
  function drawBike(x,y){
    for(const i of [0,18]){px(x+i+2,y+9,12,2,'#314b55');px(x+i+7,y+4,2,12,'#314b55');px(x+i+3,y+5,10,10,'#688f90');}
    px(x+9,y+8,15,2,'#d88767');px(x+11,y+3,3,9,'#d88767');px(x+22,y+5,3,7,'#d88767');
  }
  function person(x,y,shirt,hair='#493b3b',moving=false,face='down'){
    const xx=Math.round(x*T),yy=Math.round(y*T),hop=moving?Math.round(Math.sin(elapsed*16)*1):0;
    px(xx+3,yy+15,12,2,'#315a5970');
    px(xx+5,yy+12-hop,4,4,'#354b5c');px(xx+10,yy+12-hop,4,4,'#354b5c');
    px(xx+4,yy+6-hop,11,7,shirt);px(xx+2,yy+7-hop,3,5,shirt);px(xx+15,yy+7-hop,2,5,shirt);
    px(xx+5,yy-hop,10,7,'#eac49e');px(xx+4,yy-1-hop,12,4,hair);px(xx+6,yy+1-hop,8,2,hair);
    if(face!=='up'){px(xx+7,yy+4-hop,1,1,'#333a45');px(xx+12,yy+4-hop,1,1,'#333a45');}
    px(xx+6,yy+6-hop,8,1,'#d6a98d');
  }
  function drawBus(x,y){
    const xx=Math.round(x*T),yy=Math.round(y*T);
    px(xx-2,yy-2,37,62,'#3a4b56');px(xx,yy,33,58,'#e3b550');
    px(xx+4,yy+4,25,11,'#e6e4bb');px(xx+6,yy+6,21,8,'#73a9b0');
    for(let i=0;i<3;i++) {px(xx+5,yy+19+i*9,23,7,'#547a81');px(xx+9,yy+20+i*9,2,5,'#abc4ae');}
    px(xx+3,yy+48,27,6,'#9b813d');px(xx+5,yy+54,23,2,'#485763');
    px(xx-4,yy+8,4,10,'#344850');px(xx+33,yy+8,4,10,'#344850');
    px(xx+5,yy+50,5,3,'#eacba9');px(xx+23,yy+50,5,3,'#eacba9');
    px(xx+6,yy+1,21,2,'#f9d78b');
  }
  function npcBubble(x,y,text,bg='#e7c577'){
    const xx=x*T+9,yy=y*T-14+Math.sin(elapsed*3)*2;
    px(xx-6,yy-2,14,12,'#324b52');px(xx-5,yy-3,12,11,bg);label(text,xx+1,yy+5,'#283e45',10);
  }
  // Different original locations keep exploration visually distinct in each chapter.
  function courtyard(){
    px(0,0,W,H,'#8aa891');
    for(let y=0;y<20;y++)for(let x=0;x<30;x++){
      if(x>8&&x<23&&y>5&&y<17)tile(x,y,(x+y)%2?'#c7c6b5':'#d6d2bd');
      else if(rand(x,y)<23)px(x*T+4,y*T+9,2,2,'#a6c39c');
    }
    building(2,2,8,6,'school');building(21,2,8,6,'shop');building(22,15,7,5,'house');
    for(const [x,y] of [[2,11],[4,14],[26,10],[27,13],[13,3]])tree(x,y);
    // School notice board, benches, basketball court, and bike rack
    px(11*T,4*T,43,31,'#658078');px(11*T+3,4*T+4,37,22,'#f2dec0');px(11*T+7,4*T+7,10,8,'#d58f75');px(11*T+22,4*T+7,12,13,'#9dc4b6');
    for(const [x,y] of [[7,11],[21,12]]){px(x*T,y*T+5,36,6,'#8b6551');px(x*T+3,y*T+11,3,8,'#3f5458');px(x*T+30,y*T+11,3,8,'#3f5458');}
    px(16*T,14*T,4*T,2*T,'#a2bbab');px(17*T,14*T,3,2*T,'#faf2d3');
    label('COURTYARD',239,32,'#fff2c6',9);
  }
  function plaza(){
    px(0,0,W,H,'#7f9c83');
    for(let y=0;y<20;y++)for(let x=0;x<30;x++){
      if(x>7&&x<22&&y>5&&y<18)tile(x,y,(x+y)%2?'#c4bcaa':'#d7ccaf');
      else if(rand(x,y)<23)px(x*T+5,y*T+5,2,2,'#9ab495');
    }
    building(1,2,9,6,'shop');building(21,2,8,7,'house');
    for(const [x,y] of [[2,12],[4,17],[25,11],[26,13],[12,3]])tree(x,y);
    // Closed raised structure in the upper-right. The player never freely climbs it.
    px(21*T,10*T,7*T,4*T,'#485b5d');px(22*T,10*T+4,5*T,3*T,'#b9aba0');
    for(let j=0;j<3;j++)px(22*T+10+j*25,10*T+4,13,6,'#65878b');
    px(21*T,10*T,7*T,3,'#e4b56d');px(21*T+4,10*T+5,7,22,'#ecb96d');
    px(20*T,13*T,16,14,'#e1cf9c');label('CLOSED',22*T+50,12*T+10,'#fff0ca',8);
    for(let i=0;i<6;i++)px(21*T+i*19,10*T-2,8,5,'#e3bb70');
    label('PLAZA',224,39,'#f6f2cb',9);
    // Ground level photo spot: flowers and wall mural.
    px(4*T,11*T,3*T,3*T,'#648d87');for(let i=0;i<8;i++)px(4*T+6+i*5,11*T+10+(i%3)*8,3,4,i%2?'#e3b879':'#d991a8');
  }
  function phone(x,y){px(x,y,18,25,'#263f51');px(x+2,y+2,14,19,'#c5b8d1');px(x+5,y+6,8,5,'#6d8f8c');px(x+8,y+22,3,2,'#dcd7c5');}
  function paintWorld(){
    ctx.save();if(screenShake>0)ctx.translate(Math.floor(Math.sin(elapsed*40)*screenShake),Math.floor(Math.cos(elapsed*53)*screenShake));
    if(chapterIndex===0){ground();streetObjects(elapsed);}else if(chapterIndex===1)courtyard();else plaza();
    const risky=phase==='danger',safe=phase==='safe';
    if(chapterIndex===0){
      let pxp=player.x,pyp=player.y,lx=lucas.x,ly=lucas.y;
      if(risky){const t=elapsed;pxp=13+Math.min(3.3,t*2.35);pyp=10;lx=13+Math.min(3.5,t*2.6);ly=9.3;busY=-5+Math.max(0,t-.5)*7.5;drawBus(16.1,busY);}
      else if(safe){const t=elapsed;if(t<1.55){pxp=13;pyp=11+Math.min(3,t*1.95);lx=13;ly=10+Math.min(4,t*2.6);}else if(t<3.5){pxp=13+(t-1.55)*3.5;pyp=14;lx=13+(t-1.55)*3.3;ly=13.3;}else{pxp=19.8+Math.min(4,(t-3.5)*3);pyp=14;lx=19.5+Math.min(4,(t-3.5)*3);ly=13.2;}drawBus(16.1,Math.max(-5,-5+t*2.3));}
      else if(phase==='explore'||phase==='decision')drawBus(16.1,-4+(Math.sin(elapsed*.4)+1)*.2);
      if(!safe)person(maya.x,maya.y,'#9871b0','#45334b');
      person(lx,ly,'#d98c5e','#4f3b31',risky||safe);
      person(pxp,pyp,'#5b9cb4','#3c3447',risky||safe,player.dir);
    }else if(chapterIndex===1){
      person(11,10,'#9871b0','#45334b'); // Maya
      person(14,13,'#599a84','#4d392e'); // Amine
      person(12,11,'#d98c5e','#4f3b31'); // Lucas
      person(phase==='explore'?player.x:13,phase==='explore'?player.y:11,'#5b9cb4','#3c3447',false,player.dir);
      if(risky){for(let i=0;i<7;i++){const a=elapsed*90+i*74;phone(235+Math.sin(i*3)*a*.3,110+Math.cos(i*5)*a*.12);}}
      else if(safe){label('...',14*T+12,12*T+1,'#eaf8cf',10);}
      if(phase==='decision'||phase==='explore')phone(12*T+13,11*T-14);
    }else{
      person(11,10,'#a58fbb','#46383f'); // Lina
      person(12,11,'#d98c5e','#4f3b31'); // Noah
      person(phase==='explore'?player.x:13,phase==='explore'?player.y:11,'#5b9cb4','#3c3447',false,player.dir);
      if(risky){
        const x=22+Math.min(3,elapsed*1.4),y=10-Math.min(2,elapsed*.6);
        person(x,y,'#e8a470','#513c36',true);
        if(elapsed>1.7){px(x*T-2,y*T-3,24,4,'#f1ce92');}
      }else if(safe){label(ending==='alternative'?'PHOTO!':'BOUNDARY',24*T,15*T,'#f8f2d5',8);}
    }
    if(phase==='explore'&&!dialogueOpen){npcBubble(12,11,'!');if(L.inRange(player,current().target,2))label('E · TALK',12*T,10*T+6,'#fff5d6',8);}
    if(chapterIndex===0&&phase==='safe'&&elapsed>3.4)label('SKATEPARK',25*T,13*T,'#fff4db',8);
    if(phase==='danger'&&elapsed>=2.15)px(0,0,W,H,'#fbe6bd');
    if(impactFlash>0){ctx.fillStyle=`rgba(255,239,196,${Math.min(.92,impactFlash)})`;ctx.fillRect(0,0,W,H);}
    ctx.restore();
    px(7,7,188,20,'#203d49e9');px(9,9,3,15,'#e7bd77');
    ctx.fillStyle='#f5edcc';ctx.textAlign='left';ctx.font='bold 8px monospace';
    ctx.fillText(`${current().location} / CHAPTER ${chapterIndex+1} OF 3`,17,20);
    if(phase==='explore'){px(368,7,105,20,'#203d49e9');ctx.fillStyle='#f2dfaa';ctx.fillText('FIND FRIENDS →',376,20);}
  }
  function tick(now){
    if(!last)last=now;
    const dt=Math.min((now-last)/1000,.05);last=now;
    if(phase!=='title'&&!dialogueOpen)elapsed+=dt;
    if(phase==='explore'&&!dialogueOpen&&now>nextMove){for(const k of keys){const dir=keyToDir(k);if(dir){attemptMove(...dir);nextMove=now+130;break;}}}
    if(decisionActive&&!decisionPaused){
      decisionLeft=Math.max(0,decisionLeft-dt);
      music.setTension(.35+(1-decisionLeft/L.DECISION_SECONDS)*.65);
      renderTimer();
      if(decisionLeft===0)onDecisionTimeout();
    }
    if(phase==='danger'&&elapsed>=2.15&&!hasReached){hasReached=true;impactFlash=.94;screenShake=5;music.effect('impact');}
    if(phase==='danger'&&elapsed>3){showToast('');setPhase('gameover');music.stop();showOverlay('gameover');}
    if(phase==='safe'&&elapsed>(chapterIndex===0?5.1:3.2)){showToast('');setPhase('complete');music.effect('win');music.stop();showOverlay('complete');}
    screenShake=Math.max(0,screenShake-dt*9);impactFlash=Math.max(0,impactFlash-dt*1.5);
    paintWorld();requestAnimationFrame(tick);
  }
  reset();requestAnimationFrame(tick);
})();