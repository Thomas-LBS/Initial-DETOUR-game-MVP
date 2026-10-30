(() => {
  'use strict';
  const L = window.DetourLogic;
  const canvas = document.getElementById('game-canvas');
  const ctx = canvas.getContext('2d', {alpha:false});
  if(!ctx){ document.getElementById('screen-overlay').textContent='Your browser does not support Canvas.'; return; }
  ctx.imageSmoothingEnabled = false;
  const T=16, W=480,H=320;
  const overlay=document.getElementById('screen-overlay');
  const dialogue=document.getElementById('dialogue');
  const speakerEl=document.getElementById('speaker');
  const dialogueText=document.getElementById('dialogue-text');
  const actionsEl=document.getElementById('dialogue-actions');
  const fieldNote=document.getElementById('field-note');
  const statusEl=document.getElementById('status-line');
  const sceneLabel=document.getElementById('scene-label');
  const keys=new Set();
  let phase='title', dialogueOpen=false, player={x:8,y:11,dir:'down'}, lucas={x:12,y:11}, maya={x:11,y:10};
  let elapsed=0, last=0, nextMove=0, busY=-5, seenMaya=false, noticedRoad=false, crashCount=0, soundOn=false, audio=null, screenShake=0, impactFlash=0, hasReached=false;
  const pal={grass:'#88b47b',grass2:'#7eaa77',leaf:'#447e61',leaf2:'#66a577',dark:'#294a52',light:'#ecf2cc',stone:'#cccdb2',pave:'#e4dfc4',road:'#566871',edge:'#384e5c',cream:'#f8efcc',water:'#87c7c3',yellow:'#ebbe68',brick:'#bb866c',roof:'#be765d',shadow:'#274e5580'};
  const objects=[{x:12,y:11,id:'lucas'},{x:11,y:10,id:'maya'},{x:13,y:14,id:'sign'}];
  const rand=(x,y)=>((x*73856093^y*19349663)>>>0)%100;
  const px=(x,y,w,h,col)=>{ctx.fillStyle=col;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));};
  const tile=(x,y,col)=>px(x*T,y*T,T,T,col);
  function label(text,x,y,col='#e9f7d5',size=8){ctx.font=`bold ${size}px monospace`;ctx.textAlign='center';ctx.fillStyle='#243c44';ctx.fillText(text,x+1,y+1);ctx.fillStyle=col;ctx.fillText(text,x,y);}
  function sound(type){
    if(!soundOn) return;
    try {audio ??= new (window.AudioContext||window.webkitAudioContext)(); if(audio.state==='suspended') audio.resume();
      const osc=audio.createOscillator(), gain=audio.createGain(); const now=audio.currentTime;
      osc.type=type==='danger'?'sawtooth':'square';osc.frequency.setValueAtTime(type==='danger'?170:type==='win'?620:360,now);
      osc.frequency.exponentialRampToValueAtTime(type==='danger'?70:type==='win'?900:470,now+.12);
      gain.gain.setValueAtTime(.07,now);gain.gain.exponentialRampToValueAtTime(.001,now+.17);
      osc.connect(gain);gain.connect(audio.destination);osc.start(now);osc.stop(now+.17);
    }catch(e){/* Sound is optional. */}
  }
  function showOverlay(type){
    const templates={
      title:`<div class="overlay-card"><span class="tiny">✳ CHAPTER 01 / WESTSIDE</span><h3>DETOUR<span style="color:#e9b879">.</span></h3><p>Friday. 4:32 PM. School's out, and the skatepark is calling. One neighborhood. A lot of ways to get there.</p><div class="buttons"><button class="pixel-btn" data-action="start">▶ START ADVENTURE</button></div></div>`,
      gameover:`<div class="overlay-card"><span class="tiny" style="color:#e7b39c">✱ AN UNEXPECTED ENDING</span><h3>GAME OVER</h3><p>A school bus strikes your character at the crossing. The screen fades before showing injuries.</p><p class="ending-stat">WHAT DID YOU NOTICE BEFORE CROSSING?</p><div class="buttons"><button class="pixel-btn" data-action="retry">↶ TRY ANOTHER CHOICE</button><button class="pixel-btn secondary" data-action="reset">RESTART</button></div></div>`,
      complete:`<div class="overlay-card"><span class="tiny">✳ CHAPTER COMPLETE</span><h3>YOU MADE IT!</h3><p>The skatepark is buzzing. Lucas was impatient, but you found a way across together. Some choices take courage, not just time.</p><p class="ending-stat">DISCOVERY: AN ALTERNATIVE CAN KEEP THE GROUP TOGETHER.</p><div class="buttons"><button class="pixel-btn" data-action="retry">↶ EXPLORE ANOTHER ENDING</button><button class="pixel-btn secondary" data-action="reset">NEW GAME</button></div></div>`
    };
    overlay.innerHTML=templates[type]||'';
    overlay.querySelectorAll('[data-action]').forEach(b=>b.addEventListener('click',()=>{
      const action=b.dataset.action;
      if(action==='start') start(); if(action==='retry') retry();if(action==='reset') reset();
    }));
  }
  function setPhase(p){phase=p; elapsed=0; nextMove=0; updateJournal();}
  function updateJournal(){
    const p=phase;
    const states={explore:['active','',''],decision:['done','active',''],danger:['done','done','active'],safe:['done','done','active'],gameover:['done','done','done'],complete:['done','done','done'],title:['active','','']};
    const stage=states[p]||states.explore;
    ['explore','decide','reflect'].forEach((id,i)=>{
      const el=document.getElementById('stage-'+id);el.className='quest-stage '+stage[i];el.querySelector('.stage-check').textContent=stage[i]==='done'?'✓':stage[i]==='active'?'●':'○';
    });
    const notes={title:'Look around. Talk to people. Sometimes the details matter more than you think.',explore:'Find Lucas near the school gates. Walk with WASD or arrow keys. Press E near someone to talk.',decision:'Listen to everyone, look for clues, and make your own choice.',danger:'You followed Lucas toward the road. Watch what happens...',safe:'You suggested a different plan. Let’s see how the group responds.',gameover:'A collision is one possible consequence, not an inevitable result. Could you recognize a warning sign earlier?',complete:'You found an alternative without abandoning the group. Explore another choice to see how it might unfold.'};
    fieldNote.textContent=notes[p];
    statusEl.textContent={title:'PRESS START TO BEGIN YOUR DAY',explore:'EXPLORE THE WORLD · FIND LUCAS',decision:'A DECISION IS WAITING',danger:'CONSEQUENCES UNFOLDING...',safe:'HEADING TO THE SKATEPARK...',gameover:'CHECKPOINT AVAILABLE · TRY AGAIN',complete:'CHAPTER 01 CLEARED · REPLAY AVAILABLE'}[p];
    sceneLabel.textContent=['danger','gameover'].includes(p)?'EPISODE 01: THE CONSEQUENCE':'EPISODE 01: THE SHORTCUT';
  }
  function reset(){player={x:8,y:11,dir:'down'};lucas={x:12,y:11};maya={x:11,y:10};seenMaya=false;noticedRoad=false;hasReached=false;busY=-5;impactFlash=0;screenShake=0;closeDialogue();setPhase('title');showOverlay('title');}
  function start(){overlay.innerHTML='';setPhase('explore');sound('click');}
  function retry(){player={x:13,y:11,dir:'right'};lucas={x:12,y:11};busY=-5;impactFlash=0;screenShake=0;hasReached=false;overlay.innerHTML='';setPhase('decision');openCrossroadDialogue();sound('click');}
  function openDialogue(name,text,choices){
    dialogueOpen=true;speakerEl.textContent=name;dialogueText.textContent=text;actionsEl.replaceChildren();
    choices.forEach(c=>{const btn=document.createElement('button');btn.className='choice-btn'+(c.primary?' primary':'');btn.textContent=c.text;btn.addEventListener('click',()=>{sound('click');c.onClick();});actionsEl.appendChild(btn);});
    dialogue.classList.remove('hidden');
  }
  function closeDialogue(){dialogue.classList.add('hidden');dialogueOpen=false;actionsEl.replaceChildren();}
  function openCrossroadDialogue(){
    setPhase('decision');
    const intro=seenMaya?"Lucas: 'Come on, the skatepark's right across the road. What do you think?'":"Lucas: 'The skatepark is right there! Let's cut across. Everyone's waiting!'";
    openDialogue('LUCAS',intro,[
      {text:'Follow Lucas across',onClick:()=>beginDanger()},
      {text:'Suggest the marked crossing',onClick:()=>beginSafe(),primary:true},
      {text:'Ask Maya what she thinks',onClick:()=>askMaya()}
    ]);
  }
  function askMaya(){seenMaya=true;noticedRoad=true;
    openDialogue('MAYA',"'There's a crossing a little further down. And that parked van makes it hard to see what's coming. I wasn't sure how to say it.'",[
      {text:'Suggest the crossing together',onClick:()=>beginSafe(),primary:true},
      {text:'Still follow Lucas',onClick:()=>beginDanger()},
      {text:'Back to Lucas',onClick:()=>openCrossroadDialogue()}
    ]);
  }
  function beginDanger(){closeDialogue();setPhase('danger');busY=-5;sound('danger');}
  function beginSafe(){closeDialogue();setPhase('safe');sound('win');}
  function interact(){
    if(phase==='title'){start();return;}
    if(dialogueOpen||['danger','safe','gameover','complete'].includes(phase))return;
    if(phase==='decision'){openCrossroadDialogue();return;}
    if(L.inRange(player,{x:12,y:11},2)){openCrossroadDialogue();return;}
    if(L.inRange(player,{x:11,y:10},2)){openDialogue('MAYA',"'Hey! Lucas really wants to get to the skatepark. I saw a school bus heading this way earlier.'",[{text:'Thanks! Find Lucas',onClick:()=>{seenMaya=true;noticedRoad=true;closeDialogue();}}]);return;}
    if(L.inRange(player,{x:13,y:14},2)){noticedRoad=true;openDialogue('STREET SIGN','PEDESTRIAN CROSSING → 40 m. Traffic may be hidden by parked vehicles.',[{text:'Got it',onClick:closeDialogue}]);return;}
    openDialogue('EXPLORER',"Look for the friend with the orange exclamation mark near the school gates.",[{text:'Continue',onClick:closeDialogue}]);
  }
  function attemptMove(dx,dy){
    if(phase!=='explore'||dialogueOpen)return;
    const nx=player.x+dx,ny=player.y+dy;
    player.dir=dx>0?'right':dx<0?'left':dy<0?'up':'down';
    if(L.canWalk(nx,ny) && !(nx===lucas.x&&ny===lucas.y) && !(nx===maya.x&&ny===maya.y)){player.x=nx;player.y=ny;}
    if(player.x>=13&&player.y<=13&&player.y>=9){statusEl.textContent='NEAR THE ROAD · TALK TO LUCAS';}
  }
  function keyToDir(k){return {arrowup:[0,-1],w:[0,-1],arrowdown:[0,1],s:[0,1],arrowleft:[-1,0],a:[-1,0],arrowright:[1,0],d:[1,0]}[k];}
  window.addEventListener('keydown',e=>{
    const k=e.key.toLowerCase();
    if(keyToDir(k)||k===' '||k==='e'||k==='r')e.preventDefault();
    if(k==='r'){reset();return;}
    if(k==='e'||k===' '){if(!e.repeat)interact();return;}
    if(keyToDir(k)){keys.add(k);if(!e.repeat){const dir=keyToDir(k);attemptMove(...dir);nextMove=performance.now()+135;}}
  });
  window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
  window.addEventListener('blur',()=>keys.clear());
  const touchTimers=new Map();
  document.querySelectorAll('[data-dir]').forEach(b=>{
    const dirs={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]};const go=()=>attemptMove(...dirs[b.dataset.dir]);
    b.addEventListener('pointerdown',e=>{e.preventDefault();go();clearInterval(touchTimers.get(b));touchTimers.set(b,setInterval(go,150));b.setPointerCapture(e.pointerId);});
    const stop=()=>{clearInterval(touchTimers.get(b));touchTimers.delete(b);};
    b.addEventListener('pointerup',stop);b.addEventListener('pointercancel',stop);b.addEventListener('lostpointercapture',stop);
  });
  document.getElementById('touch-interact').addEventListener('click',interact);
  document.getElementById('restart-btn').addEventListener('click',reset);
  document.getElementById('mute-btn').addEventListener('click',()=>{soundOn=!soundOn;document.getElementById('mute-btn').textContent=soundOn?'♫':'♪̸';document.getElementById('mute-btn').setAttribute('aria-label',soundOn?'Mute sound':'Unmute sound');sound('click');});

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
  function paintWorld(){
    ctx.save(); if(screenShake>0){ctx.translate(Math.floor(Math.sin(elapsed*40)*screenShake),Math.floor(Math.cos(elapsed*53)*screenShake));}
    ground();streetObjects(elapsed);
    const risky=phase==='danger',safe=phase==='safe';
    let pxp=player.x,pyp=player.y,lx=lucas.x,ly=lucas.y;
    if(risky){
      const t=elapsed;
      // The player follows Lucas onto the road. School bus approaches at an unsignaled point.
      pxp=13+Math.min(3.3,t*2.35);pyp=10;lx=13+Math.min(3.5,t*2.6);ly=9.3;
      busY=-5+Math.max(0,t-.5)*7.5;
      drawBus(16.1,busY);
    } else if(safe){
      const t=elapsed;
      if(t<1.55){pxp=13;pyp=11+Math.min(3,t*1.95);lx=13;ly=10+Math.min(4,t*2.6);}
      else if(t<3.5){pxp=13+(t-1.55)*3.5;pyp=14;lx=13+(t-1.55)*3.3;ly=13.3;}
      else {pxp=19.8+Math.min(4,(t-3.5)*3);pyp=14;lx=19.5+Math.min(4,(t-3.5)*3);ly=13.2;}
      drawBus(16.1,Math.max(-5,-5+t*2.3));
    } else if(phase==='explore'||phase==='decision'){drawBus(16.1,-4+(Math.sin(elapsed*.4)+1)*.2);}
    if(!safe){person(maya.x,maya.y,'#9871b0','#45334b');}
    person(lx,ly,'#d98c5e','#4f3b31',risky||safe);
    person(pxp,pyp,'#5b9cb4','#3c3447',risky||safe,player.dir);
    if(phase==='explore' && !dialogueOpen){npcBubble(12,11,'!');}
    if(phase==='explore' && L.inRange(player,{x:12,y:11},2)){label('E · TALK',12*T,10*T+6,'#fff5d6',8);}
    if(phase==='safe' && elapsed>3.4){label('SKATEPARK',25*T,13*T,'#fff4db',8);}
    if(phase==='danger' && elapsed>=2.15){px(0,0,W,H,'#fbe6bd');}
    if(impactFlash>0){ctx.fillStyle=`rgba(255,239,196,${Math.min(.92,impactFlash)})`;ctx.fillRect(0,0,W,H);}
    ctx.restore();
    // HUD
    px(7,7,151,20,'#203d49e9');px(9,9,3,15,'#e7bd77');
    ctx.fillStyle='#f5edcc';ctx.textAlign='left';ctx.font='bold 8px monospace';ctx.fillText('WESTSIDE  /  FRI 4:32 PM',17,20);
    if(phase==='explore'){px(370,7,101,20,'#203d49e9');ctx.fillStyle='#f2dfaa';ctx.fillText('FIND LUCAS  →',379,20);}
  }
  function tick(now){
    if(!last)last=now;const dt=Math.min((now-last)/1000,.05);last=now;
    if(phase!=='title' && !dialogueOpen)elapsed+=dt;
    if(phase==='explore'&&!dialogueOpen&&now>nextMove){for(const k of keys){const dir=keyToDir(k);if(dir){attemptMove(...dir);nextMove=now+130;break;}}}
    if(phase==='danger' && elapsed>=2.15 && !hasReached){
      hasReached=true;impactFlash=.94;screenShake=5;sound('danger');
    }
    if(phase==='danger' && elapsed>2.8){crashCount++;setPhase('gameover');showOverlay('gameover');}
    if(phase==='safe' && elapsed>5.1){setPhase('complete');showOverlay('complete');sound('win');}
    screenShake=Math.max(0,screenShake-dt*9);impactFlash=Math.max(0,impactFlash-dt*1.5);
    paintWorld();requestAnimationFrame(tick);
  }
  reset();requestAnimationFrame(tick);
})();