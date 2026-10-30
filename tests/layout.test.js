const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const css=fs.readFileSync(path.join(root,'styles.css'),'utf8');

test('player remains the hero with a viewport at least 75vh high',()=>{
 assert.match(css,/\.screen-wrap\s*\{[^}]*height:76vh;height:76dvh/);
 assert.match(css,/\.screen-wrap canvas\s*\{[^}]*object-fit:contain/);
 assert.match(html,/id="game-canvas"/);
});
test('every dynamically referenced interface element exists',()=>{
 for(const id of ['screen-overlay','scene-toast','dialogue','speaker','speaker-portrait','dialogue-text','dialogue-actions','field-note','status-line','scene-label','quest-title','quest-detail','chapter-number','mute-btn','restart-btn','touch-interact','stage-explore','stage-decide','stage-reflect','location-chip','mode-chip','hud-prompt','fullscreen-btn'])assert.ok(html.includes(`id="${id}"`),id);
});
test('foreground labels and comic speech bubbles have contrasting themes',()=>{
 assert.match(css,/\.foreground-hud\{[^}]*z-index:4/);
 assert.match(css,/\.dialogue\{[^}]*z-index:8/);
 assert.match(css,/\.dialogue\{[^}]*background:#fff7e7;color:#251632/);
 assert.match(css,/\.dialogue\.dark\{[^}]*background:#251532;color:#fff4df/);
 assert.match(css,/\.dialogue::before\{/);
 assert.match(css,/\.hud-prompt\{[^}]*background:#271534;color:#f6e4ff/);
});
test('three levels remain navigable and all source scripts have versioned URLs',()=>{
 const matches=[...html.matchAll(/data-chapter="(\d)"/g)];
 assert.deepEqual(matches.map(m=>m[1]),['0','1','2']);
 for(const file of ['logic.js','music.js','cinematics.js','social.js','gba-art.js','pixel-snow.js','game.js'])assert.ok(html.includes(`${file}?v=9`),file);
 assert.ok(html.includes('styles.css?v=9'));
});
test('no forced decisions',()=>{
 assert.doesNotMatch(html,/decision-timer|DECISION_SECONDS|10.second countdown/i);
});