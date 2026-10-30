/* Original procedural chiptune loops. No licensed or sampled music. */
(function(root){
  'use strict';
  const melodies={
    street:{bpm:126,lead:[60,64,67,64,62,64,67,69,67,64,62,60,57,60,62,59],bass:[36,null,43,null,41,null,43,null]},
    social:{bpm:146,lead:[64,67,66,62,64,69,67,62,66,69,71,67,64,62,66,62],bass:[40,null,47,43,40,null,47,42]},
    danger:{bpm:164,lead:[57,58,62,58,57,65,62,58,57,58,62,65,64,62,58,57],bass:[33,null,34,null,33,null,38,34]}
  };
  class Chiptune{
    constructor(){this.ctx=null;this.enabled=true;this.track='street';this.step=0;this.nextTime=0;this.interval=0;this.running=false;this.tension=0;this.master=null;}
    ensure(){if(this.ctx)return true;const C=root.AudioContext||root.webkitAudioContext;if(!C)return false;try{this.ctx=new C();this.master=this.ctx.createGain();this.master.gain.value=.12;this.master.connect(this.ctx.destination);return true;}catch{return false;}}
    async start(){if(!this.enabled||!this.ensure())return;try{await this.ctx.resume();}catch{return;}this.running=true;this.nextTime=this.ctx.currentTime+.06;this.schedule();if(!this.interval)this.interval=setInterval(()=>this.schedule(),90);}
    note(midi,time,duration,volume,type='square'){
      if(midi==null||!this.ctx)return;
      const osc=this.ctx.createOscillator(),env=this.ctx.createGain();osc.type=type;
      osc.frequency.value=440*Math.pow(2,(midi-69)/12);
      env.gain.setValueAtTime(.0001,time);env.gain.exponentialRampToValueAtTime(Math.max(.0002,volume),time+.009);
      env.gain.exponentialRampToValueAtTime(.0001,time+duration);
      osc.connect(env);env.connect(this.master);osc.start(time);osc.stop(time+duration+.015);
    }
    schedule(){if(!this.running||!this.ctx||this.ctx.state!=='running')return;const tune=melodies[this.track];const beat=60/tune.bpm/2;
      while(this.nextTime<this.ctx.currentTime+.24){const n=this.step;this.note(tune.lead[n%tune.lead.length],this.nextTime,beat*.75,.17,'square');
        if(n%2===0)this.note(tune.bass[(n/2)%tune.bass.length],this.nextTime,beat*1.3,.19,'triangle');
        if(this.tension>0&&n%2===1)this.note(85,this.nextTime,Math.min(.07,beat*.4),this.tension*.08,'sawtooth');
        this.nextTime+=beat;this.step++;}}
    setTrack(name){this.track=melodies[name]?name:'street';this.step=0;if(this.ctx)this.nextTime=this.ctx.currentTime+.06;}
    setTension(value){this.tension=Math.max(0,Math.min(1,value));}
    effect(kind){if(!this.enabled||!this.ctx||this.ctx.state!=='running')return;const at=this.ctx.currentTime+.01;
      if(kind==='impact'||kind==='crash'){[62,53,44,33].forEach((n,i)=>this.note(n,at+i*.105,.18,.23,'sawtooth'));}
       else if(kind==='horn'){[49,48,47].forEach((n,i)=>this.note(n,at+i*.14,.31,.20,'sawtooth'));}
       else if(kind==='notification'){[79,84,86,79,88].forEach((n,i)=>this.note(n,at+i*.07,.11,.14,'square'));}
      else if(kind==='win'){[60,64,67,72].forEach((n,i)=>this.note(n,at+i*.11,.17,.23));}
      else this.note(76,at,.06,.11);}
    stop(){this.running=false;this.tension=0;if(this.interval){clearInterval(this.interval);this.interval=0;}}
    toggle(){this.enabled=!this.enabled;if(!this.enabled){this.stop();this.ctx?.suspend();}else this.start();return this.enabled;}
  }
  root.DetourMusic=new Chiptune();
})(window);