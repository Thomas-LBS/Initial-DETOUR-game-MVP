/* DETOUR v7 purple night: falling pixel snow and occasional temporary mergers.
   Standalone background animation. No library, images, tracking, or interaction capture. */
(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.DetourSnow=api;
})(typeof window!=='undefined'?window:undefined,function(){
  'use strict';
  const palette=['#F8EDFF','#D9C4F0','#B795E6','#EACFFA'];
  const clamp=(x,lo,hi)=>Math.min(hi,Math.max(lo,x));
  function countFor(width){return width<600?24:width<1050?38:62;}
  function near(a,b,padding=4){return (a.x-b.x)**2+(a.y-b.y)**2<=(a.size+b.size+padding)**2;}
  function seed(n){return (Math.sin((n+1)*233.781)*41758.5453)%1;}
  function random(n){const x=seed(n);return x<0?x+1:x;}
  function particle(i,w,h){
    return {x:random(i*7+1)*w,y:random(i*7+2)*h,
      size:1+Math.floor(random(i*7+3)*2),speed:8+random(i*7+4)*24,
      drift:2+random(i*7+5)*9,phase:random(i*7+6)*Math.PI*2,
      pixelize:random(i*7+7)>.62,shade:i%palette.length};
  }
  function init(canvas){
    if(!canvas||typeof window==='undefined')return null;
    const ctx=canvas.getContext('2d',{alpha:true});if(!ctx)return null;
    let w=window.innerWidth,h=window.innerHeight,ratio=1,particles=[],running=false,last=0,frame=0,raf=0;
    const m=window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const reduced=()=>!!m?.matches;
    function resize(){
      w=Math.max(1,window.innerWidth);h=Math.max(1,window.innerHeight);
      ratio=clamp(window.devicePixelRatio||1,1,2);
      canvas.width=Math.round(w*ratio);canvas.height=Math.round(h*ratio);
      ctx.setTransform(ratio,0,0,ratio,0,0);
      particles=Array.from({length:countFor(w)},(_,i)=>particle(i,w,h));
      render(true);
    }
    function square(x,y,size,color,alpha){
      ctx.globalAlpha=alpha;ctx.fillStyle=color;
      ctx.fillRect(Math.round(x),Math.round(y),Math.max(1,size),Math.max(1,size));
      ctx.globalAlpha=1;
    }
    function render(staticFrame=false){
      ctx.clearRect(0,0,w,h);
      for(const p of particles){
        const pulse=staticFrame?0:Math.sin(frame*.02+p.phase);
        const shape=p.pixelize&&pulse>.68;
        const alpha=.3+.35*(.5+.5*Math.sin(frame*.019+p.phase));
        if(shape){ // Tiny 2x2 digital flake that flashes from round-ish dot to pixel square.
          square(p.x,p.y,p.size+1,palette[p.shade],alpha);
          square(p.x+2,p.y-1,1,'#F8EDFF',alpha*.75);
        }else square(p.x,p.y,p.size,palette[p.shade],alpha);
      }
      if(staticFrame)return;
      // Periodic contact effects: bounded checks for <=62 particles.
      // Merging is purely optical: the original particles separate without mutation.
      for(let i=0;i<particles.length;i++)for(let j=i+1;j<particles.length;j++){
        const a=particles[i],b=particles[j];
        if(!near(a,b,2))continue;
        const pulse=.3+.7*(Math.sin(frame*.07+i+j)**2);
        const midX=(a.x+b.x)/2,midY=(a.y+b.y)/2;
        square(midX-2,midY-2,5,'#E9D7FC',.38*pulse);
        square(midX-1,midY-1,3,'#FAF1FF',.6*pulse);
      }
    }
    function step(timestamp){
      if(!running)return;
      // Cap redraws around 30 fps; avoids spending a full-screen fill every frame.
      if(last && timestamp-last<31){raf=window.requestAnimationFrame(step);return;}
      const dt=last?clamp((timestamp-last)/1000,0,.06):0;
      last=timestamp;frame++;
      for(const p of particles){
        p.y+=p.speed*dt;
        p.x+=Math.sin(timestamp*.00045+p.phase)*p.drift*dt;
        if(p.y>h+8){p.y=-8;p.x=random(frame+p.shade*31)*w;}
        if(p.x<0)p.x=w;if(p.x>w)p.x=0;
      }
      render();raf=window.requestAnimationFrame(step);
    }
    function pause(){running=false;last=0;if(raf)window.cancelAnimationFrame(raf);raf=0;}
    function resume(){
      if(running||document.hidden||reduced())return;
      running=true;last=0;raf=window.requestAnimationFrame(step);
    }
    function sync(){pause();resize();resume();}
    function visibility(){if(document.hidden)pause();else resume();}
    resize();resume();
    window.addEventListener('resize',sync,{passive:true});
    document.addEventListener('visibilitychange',visibility);
    if(m?.addEventListener)m.addEventListener('change',sync);
    return {stop(){pause();window.removeEventListener('resize',sync);document.removeEventListener('visibilitychange',visibility);if(m?.removeEventListener)m.removeEventListener('change',sync);},render,resize};
  }
  function start(){
    if(typeof document==='undefined')return null;
    const canvas=document.getElementById('pixel-snow');
    return init(canvas);
  }
  if(typeof document!=='undefined'){
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
    else start();
  }
  return {palette,countFor,near,particle,init};
});