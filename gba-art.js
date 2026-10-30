/* DETOUR v7 — original GBA-era-inspired pixel-art overlay and sprite renderer.
   Pure canvas primitives, no external sprite sheets, copyrighted art, or game logic. */
(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports) module.exports=api;
  if(root) root.DetourArt=api;
})(typeof window!=='undefined'?window:undefined,function(){
  'use strict';
  const TILE=16;
  const rect=(ctx,x,y,w,h,color)=>{ctx.fillStyle=color;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));};
  const hash=(x,y,s=0)=>((Math.imul(x+13,73856093)^Math.imul(y+7,19349663)^Math.imul(s+5,83492791))>>>0)%100;
  const normalizeDirection=face=>['down','up','left','right'].includes(face)?face:'down';
  const walkFrame=(time,moving)=>moving?Math.floor(time*8)%4:0;
  const skin='#F2C9A1',skinShadow='#D9A27F',ink='#263B4D',shoe='#263747';
  function drawSprite(ctx,{x,y,shirt='#6EA8BB',hair='#413845',moving=false,face='down',time=0,variant='npc'}={}){
    if(!ctx||!Number.isFinite(x)||!Number.isFinite(y))return;
    face=normalizeDirection(face);
    const frame=walkFrame(time,moving),stride=[0,2,0,-2][frame],bob=moving?(frame%2?1:0):Math.sin(time*2+(variant==='npc'?1:0))>0.83?1:0;
    const X=Math.round(x*TILE),Y=Math.round(y*TILE),top=Y-7-bob;
    const P=(dx,dy,w,h,c)=>rect(ctx,X+dx,top+dy,w,h,c);
    // Soft, deliberately pixelated ground contact. Do not blur the game canvas.
    rect(ctx,X+2,Y+14,14,3,'#233F4680');rect(ctx,X+5,Y+16,8,1,'#24463C50');
    // Feet swing in a four-frame walking cycle for every direction.
    if(face==='left'||face==='right'){
      P(4,19,6,5,shoe);P(10+(moving?stride/2:0),19,5,5,'#35485A');
      P(3,18,4,2,'#F8E5C2');
    }else{
      P(4+stride,19,5,5,shoe);P(10-stride,19,5,5,'#3C4E60');
      P(4+stride,23,6,2,'#E4DBB8');P(10-stride,23,6,2,'#E4DBB8');
    }
    // Oversized backpack reads clearly at GBA resolution in profile/back view.
    if(face==='up'){P(3,10,13,11,'#536D79');P(4,12,11,7,'#A57E5C');}
    if(face==='left'){P(12,10,5,10,'#4C677B');P(14,13,3,5,'#D5AE64');}
    if(face==='right'){P(1,10,5,10,'#4C677B');P(1,13,3,5,'#D5AE64');}
    // Arms and outfit shading (walks without changing hitbox).
    P(3,11+(moving&&frame===1?1:0),3,8,skinShadow);
    P(15,11+(moving&&frame===3?1:0),3,8,skin);
    P(4,10,12,11,shirt);P(4,10,12,2,'#FFFFFF28');P(5,17,10,3,'#182B3C24');
    P(5,10,2,8,'#FFFFFF29');P(13,12,2,7,'#172B4338');
    if(face==='up'){
      P(6,5,9,8,hair);P(5,7,11,4,hair);P(8,13,6,2,'#6B4F48');
      P(8,10,2,3,'#FFFFFF35');
    }else if(face==='down'){
      P(6,3,9,11,skin);P(5,6,11,6,skin);
      P(5,3,12,5,hair);P(7,1,9,4,hair);
      P(7,3,3,2,'#FFFFFF33');P(15,5,2,5,hair);
      // A blink is subtle and non-destructive.
      const blink=Math.floor(time*1.65)%11===10;
      P(8,10,2,blink?1:2,ink);P(13,10,2,blink?1:2,ink);
      P(10,14,4,1,skinShadow);P(10,15,3,1,'#B87478');
    }else{
      const facingRight=face==='right';
      P(6,4,9,10,skin);P(facingRight?8:5,6,10,7,skin);
      P(5,3,11,5,hair);P(facingRight?4:14,6,3,6,hair);
      P(facingRight?14:7,10,2,2,ink);P(facingRight?15:5,12,3,2,skinShadow);
      P(9,15,5,1,'#B87478');
    }
    // Tiny necklace / collar and pocket create distinctive clothing texture.
    P(9,10,4,2,'#FAE4BF');P(face==='up'?12:10,17,3,2,'#FFFFFF65');
    if(variant==='player'){P(5,12,2,5,'#EBC770');P(5,17,2,2,'#D49D52');}
  }
  function scatter(ctx,seed,area,colors,count=36){
    for(let i=0;i<count;i++){
      const x=area.x+hash(i,seed,0)/100*area.w;
      const y=area.y+hash(i,seed,1)/100*area.h;
      if(area.skip&&area.skip(x,y))continue;
      rect(ctx,x,y,2+(i%3===0?1:0),1+(i%4===0?1:0),colors[i%colors.length]);
    }
  }
  function bench(ctx,x,y){
    rect(ctx,x+2,y+6,34,5,'#765947');rect(ctx,x+2,y+4,34,3,'#C58F65');
    rect(ctx,x+5,y+11,4,8,'#364F52');rect(ctx,x+30,y+11,4,8,'#364F52');
    rect(ctx,x+2,y+8,34,1,'#E4B688');
  }
  function flowerPatch(ctx,x,y){
    rect(ctx,x,y,50,21,'#4A8364');rect(ctx,x+2,y+2,46,17,'#67A879');
    for(let i=0;i<12;i++){
      const xx=x+6+(i*17)%39,yy=y+3+(i*7)%14;
      rect(ctx,xx,yy,2,4,'#235747');
      rect(ctx,xx-2,yy-1,5,3,['#F2C665','#EE9FC2','#E2D7EF'][i%3]);
    }
    rect(ctx,x,y+20,50,3,'#B6B89A');
  }
  function sign(ctx,x,y,text,bg='#F7DF9E'){
    rect(ctx,x+8,y+12,3,23,'#475F60');rect(ctx,x,y,35,16,'#334F59');
    rect(ctx,x+2,y+2,31,12,bg);ctx.font='bold 6px monospace';ctx.fillStyle='#26384A';ctx.fillText(text,x+4,y+11);
  }
  function detailedTree(ctx,cx,cy,time=0){
    const x=cx*TILE,y=cy*TILE;
    // Additional canopy clusters are drawn atop the existing simple tree.
    for(let i=0;i<7;i++){
      const ox=[-10,-4,5,9,-8,3,0][i],oy=[-13,-17,-15,-8,-6,-6,-20][i];
      const c=['#286C51','#438F65','#5FAB73'][i%3];
      rect(ctx,x+ox,y+oy,8,6,c);
    }
    rect(ctx,x-8,y-12,5,2,'#9FD08C');
    if(Math.sin(time*1.2+cx*2.7)>0.97)rect(ctx,x+5,y-12,2,2,'#D5E7AB');
  }
  function drawSchoolDetails(ctx,x,y,w,time){
    // Roof tiles and architectural details for an original school storefront.
    const X=x*TILE,Y=y*TILE;
    for(let i=0;i<w*2;i++){
      const xx=X+4+i*8;
      rect(ctx,xx,Y+3,5,2,'#F6D6A5');
      if(i%2===0)rect(ctx,xx+1,Y+7,2,1,'#6B4C5B');
    }
    rect(ctx,X+10,Y+11,9,4,'#4C6D76');rect(ctx,X+11,Y+12,7,2,'#A4CAD1');
    rect(ctx,X+w*TILE-20,Y+11,10,4,'#4C6D76');
    if(Math.sin(time*1.1)>0.9)rect(ctx,X+22,Y+20,3,2,'#FFF7D3');
  }
  function drawScene(ctx,{chapter=0,time=0,phase='explore'}={}){
    if(!ctx)return;
    const f=Math.floor(time*2);
    if(chapter===0){
      // Westside: roadside details, flowers, signs and mini-mural near school.
      scatter(ctx,9,{x:215,y:0,w:23,h:300},['#F5EBD5','#C9BD98','#B0BAA2'],65);
      scatter(ctx,11,{x:307,y:0,w:28,h:310},['#F5EBD5','#C9BD98','#B0BAA2'],65);
      scatter(ctx,12,{x:243,y:0,w:58,h:318},['#627782','#43565E','#819199'],52);
      drawSchoolDetails(ctx,2,3,9,time);
      flowerPatch(ctx,68,157);flowerPatch(ctx,348,224);
      sign(ctx,202,213,'CROSS');
      detailedTree(ctx,12,2,time);detailedTree(ctx,21,2,time);
      rect(ctx,400,224,32,4,'#41665B');rect(ctx,401,227,28,2,'#E3B975');
      if(phase==='explore'){
        rect(ctx,321,95+(f%2),3,2,'#CBEEC2');
        rect(ctx,331,92+(f%2),2,2,'#F9E9BF');
      }
    }else if(chapter===1){
      // Schoolyard: marked games, noticeboard posters, bins and bike stands.
      scatter(ctx,5,{x:155,y:105,w:172,h:144},['#C9C4AC','#E8DBC1','#B8BDB2'],70);
      rect(ctx,255,226,72,2,'#F6EBCB');rect(ctx,263,235,56,2,'#F6EBCB');
      rect(ctx,270,222,2,38,'#F6EBCB');rect(ctx,318,222,2,38,'#F6EBCB');
      for(let i=0;i<5;i++){rect(ctx,48+i*15,225,13,17,['#4E867B','#6C9DA3','#6C8278'][i%3]);rect(ctx,50+i*15,221,9,4,'#2C5555');}
      sign(ctx,135,74,'CLUBS','#E6BDDF');
      bench(ctx,102,234);flowerPatch(ctx,340,95);
      detailedTree(ctx,4,14,time);
      if(phase==='explore')rect(ctx,180,96+(f%2),8,3,'#EEC993');
    }else{
      // Plaza: mural, streetlights, bricks, caution tape and view railings.
      scatter(ctx,7,{x:136,y:112,w:212,h:168},['#EADBB9','#B6A998','#A9ADA2'],80);
      rect(ctx,65,173,60,32,'#405F73');
      const colors=['#E0B96D','#C87A91','#9BC9B5','#8E82B7'];
      for(let i=0;i<12;i++){
        rect(ctx,70+(i%6)*9,178+Math.floor(i/6)*12,7,9,colors[(i+Math.floor(i/3))%4]);
      }
      rect(ctx,337,163,96,3,'#D7AB65');
      for(let i=0;i<9;i++){
        rect(ctx,340+i*11,161,5,3,i%2?'#3F4347':'#EAC671');
        rect(ctx,341+i*11,168,3,12,'#536D6C');
      }
      sign(ctx,317,221,'CLOSED','#EBCB8D');
      flowerPatch(ctx,123,233);bench(ctx,226,262);
      detailedTree(ctx,26,13,time);
      if(phase==='explore')rect(ctx,417,182+(f%2),4,3,'#F8EEC9');
    }
  }
  return {TILE,walkFrame,normalizeDirection,drawSprite,drawScene};
});