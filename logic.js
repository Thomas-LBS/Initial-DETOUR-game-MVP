/* Pure DETOUR game rules. Kept separate for easy unit testing. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.DetourLogic = api;
})(typeof window !== 'undefined' ? window : undefined, function () {
  'use strict';
  const COLS = 30, ROWS = 20, TILE = 16;
  const CHOICES = Object.freeze({ FOLLOW: 'follow', CROSS: 'cross', MAYA: 'maya' });
  const blocked = (x,y) => (
    x < 1 || x > 28 || y < 1 || y > 18 ||
    (x>=2 && x<=10 && y>=3 && y<=8) ||
    (x>=22 && x<=28 && y>=2 && y<=5) ||
    (x>=2 && x<=8 && y>=16 && y<=18) ||
    (x>=22 && x<=28 && y>=16 && y<=18) ||
    (x>=15 && x<=18) // Road: only scripted branches cross it.
  );
  function canWalk(x,y){ return Number.isInteger(x) && Number.isInteger(y) && !blocked(x,y); }
  function inRange(player, point, range=2){ return Math.abs(player.x-point.x)+Math.abs(player.y-point.y)<=range; }
  function consequence(choice){
    if(choice===CHOICES.FOLLOW) return 'collision';
    if(choice===CHOICES.CROSS) return 'safe-arrival';
    if(choice===CHOICES.MAYA) return 'new-information';
    return null;
  }
  function nextPhase(phase, event){
    if(phase==='title' && event==='start') return 'explore';
    if(phase==='explore' && event==='talk') return 'decision';
    if(phase==='decision' && event==='follow') return 'danger';
    if(phase==='decision' && event==='cross') return 'safe';
    if(phase==='danger' && event==='impact') return 'gameover';
    if(phase==='safe' && event==='arrived') return 'complete';
    if(['gameover','complete'].includes(phase) && event==='retry') return 'decision';
    return phase;
  }
  return {COLS,ROWS,TILE,CHOICES,canWalk,inRange,consequence,nextPhase};
});