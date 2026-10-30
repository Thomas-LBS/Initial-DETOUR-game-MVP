/* DETOUR v4: original cartoon impact effects. No external imagery or graphic injury. */
(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.DetourCinematics=api;
})(typeof window!=='undefined'?window:undefined,function(){
  'use strict';
  const timings={collision:[2.18,4.9],fall:[2.36,4.9],spread:[1.05,5.4]};
  const durationFor=ending=>timings[ending]?.[1]||3;
  const impactAt=ending=>timings[ending]?.[0]||2.15;
  function frameFor(e,t){
    if(!timings[e])return'none';
    if(e==='spread')return t<1.05?'sending':t<2.6?'viral':t<3.65?'overload':'silence';
    return t<1.5?'setup':t<impactAt(e)?'warning':t<3.35?'impact':'aftermath';
  }
  const rect=(ctx,x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));};
  function text(ctx,s,x,y,c='#fff3d0',size=15){
    ctx.font='900 '+size+'px monospace';ctx.textAlign='center';
    ctx.fillStyle='#0e2634';ctx.fillText(s,x+2,y+2);
    ctx.fillStyle=c;ctx.fillText(s,x,y);
  }
  function banner(ctx,s,y=269,c='#ffe6a6'){rect(ctx,48,y-23,384,36,'#182d3de8');text(ctx,s,240,y,c,15);}
  function burst(ctx,x,y,t){
    const colors=['#bf4d59','#e87966','#ffc984','#f9e4b4'];
    for(let i=0;i<25;i++){const a=i*2.4,d=Math.min(1,t)*(12+(i%5)*9);
      rect(ctx,x+Math.cos(a)*d,y+Math.sin(a)*d,3+i%5,4+i%4,colors[i%colors.length]);}
  }
  function redInkBurst(ctx,t){
    // Square red-ink fragments are abstract cartoon punctuation, not anatomy.

    const colors=['#BA3D55','#D95B63','#F0876B','#F4B17B'];
    for(let i=0;i<16;i++){
      const dist=16+(i%5)*11,side=i%2===0?0:480,angle=i*2.6;
      const x=side+(side?-1:1)*(6+dist*Math.min(1,t));
      const y=52+(i*37)%222+Math.sin(angle)*8;
      rect(ctx,x,y,5+(i%4)*3,5+(i%3)*4,colors[i%colors.length]);
    }
  }
  function cloud(ctx,x,y,word){
    for(let i=0;i<10;i++){const a=i*Math.PI/5;rect(ctx,x+Math.cos(a)*21-10,y+Math.sin(a)*15-9,23,20,i%2?'#f7d392':'#fff0c7');}
    text(ctx,word,x,y+4,'#a83d50',14);
  }
  function shoe(ctx,x,y,angle){
    ctx.save();ctx.translate(x,y);ctx.rotate(angle);rect(ctx,-10,-5,15,10,'#263d4b');rect(ctx,1,-1,12,9,'#e7d4b1');rect(ctx,-10,5,23,3,'#fff8db');ctx.restore();
  }
  function phone(ctx,x,y,a){
    ctx.save();ctx.translate(x,y);ctx.rotate(a);
    rect(ctx,-13,-23,26,46,'#182e3e');rect(ctx,-10,-19,20,34,'#accbb7');
    rect(ctx,-7,-13,14,6,'#eac891');rect(ctx,-6,0,12,9,'#d67e8b');ctx.restore();
  }
  function chat(ctx,x,y,s,color){rect(ctx,x+4,y+4,113,29,'#122734');rect(ctx,x,y,113,29,color);text(ctx,s,x+56,y+20,'#243849',11);}
  function lunchPhoto(ctx){
    rect(ctx,167,76,146,146,'#F5E7C9');rect(ctx,171,80,138,108,'#C7DCBA');
    rect(ctx,216,94,46,20,'#523F4B');rect(ctx,222,106,33,28,'#ECC39D');
    rect(ctx,226,115,4,4,'#273C45');rect(ctx,244,115,4,4,'#273C45');
    rect(ctx,209,136,63,37,'#599A84');rect(ctx,235,158,17,7,'#E6A659');
    rect(ctx,182,175,115,12,'#B58B73');rect(ctx,209,169,52,8,'#F6E5C3');
    for(let i=0;i<8;i++)rect(ctx,231+(i%4)*8,151+Math.floor(i/4)*8,5,4,'#E7A74D');
    rect(ctx,170,194,140,23,'#241930');text(ctx,'SOUP OF THE DAY',240,211,'#F7D6A6',12);
  }
  function draw(ctx,{ending,time,width:W,height:H,reducedMotion=false}={}){
    if(!timings[ending])return;
    ctx.save();
    const stage=frameFor(ending,time);
    if(ending==='collision'){
      if(stage==='warning')banner(ctx,'BEEEEEP!',65);
      if(stage==='impact'){burst(ctx,264,169,(time-2.18)*2);redInkBurst(ctx,(time-2.18)*2);cloud(ctx,264,168,'BONK!');
        shoe(ctx,260+(time-2.18)*85,124-(time-2.18)*43,reducedMotion?0:time*3);
        banner(ctx,'THAT WAS NOT A SHORTCUT');}
      if(stage==='aftermath'){rect(ctx,0,0,W,H,'#172839f0');shoe(ctx,334,164,1.4);
        text(ctx,'UNEXPECTED BUS STOP',240,128,'#ffe0a0',18);
        text(ctx,'LUCAS: "DUDE... NO."',240,191,'#f4e7c7',13);}
    }else if(ending==='fall'){
      if(stage==='warning'){banner(ctx,'WOBBLE... WOBBLE...',70);text(ctx,'!',397,155,'#ffe0a0',27);}
      if(stage==='impact'){burst(ctx,372,198,(time-2.36)*2);redInkBurst(ctx,(time-2.36)*2);cloud(ctx,371,200,'CRASH!');
        phone(ctx,320-(time-2.36)*27,98+(time-2.36)*80,reducedMotion?0:time*2);
        banner(ctx,'GRAVITY: 1 / CLOUT: 0');}
      if(stage==='aftermath'){rect(ctx,0,0,W,H,'#172839ee');phone(ctx,330,194,-.3);
        text(ctx,'THE PHOTO CAN WAIT',240,124,'#ffe0a0',19);
        text(ctx,'NOAH: "CALL FOR HELP!"',240,186,'#f4e7c7',13);}
    }else{
      if(stage==='sending'){lunchPhoto(ctx);banner(ctx,'SENT.',270);}
      if(stage==='viral'||stage==='overload'){
        lunchPhoto(ctx);
        if(stage==='overload')rect(ctx,0,0,W,H,'#322b42c9');
        const words=['LOL','SHARED','LOL','SCREENSHOT','REPOST','LOL','FORWARDED','...','SHARE','MORE','HA HA','SENT'];
        const count=stage==='viral'?8:12;
        for(let i=0;i<count;i++){
          const wobble=reducedMotion?0:Math.sin(time*4+i)*5;
          chat(ctx,19+(i%4)*118,24+Math.floor(i/4)*84+wobble,words[i],i%2?'#f7d4a0':'#d9eac5');
        }
        if(stage==='overload')banner(ctx,'THE JOKE SPREADS.',273);
      }
      if(stage==='silence'){rect(ctx,0,0,W,H,'#172839f5');rect(ctx,48,76,384,149,'#304459');
        rect(ctx,65,92,352,30,'#425567');text(ctx,'GROUP CHAT',240,112,'#ffe0a0',14);
        text(ctx,'AMINE LEFT THE CHAT.',240,167,'#fff1d9',17);
        text(ctx,'SOME THINGS CANNOT BE UNSENT.',240,196,'#e7b8aa',10);}
    }
    ctx.restore();
  }
  return {durationFor,impactAt,frameFor,draw};
});