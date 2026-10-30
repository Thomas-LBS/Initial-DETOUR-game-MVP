const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const L=require('../logic');
const game=fs.readFileSync(path.join(__dirname,'../game.js'),'utf8');
test('random choice order does not mutate the underlying source list',()=>{
 const original=['safe','cooperative','social','danger'];
 const shuffled=L.shuffleChoices(original,()=>0);
 assert.deepEqual(original,['safe','cooperative','social','danger']);
 assert.deepEqual(shuffled,['cooperative','social','danger','safe']);
 assert.notEqual(shuffled,original);
});
test('shuffled choices preserve the same callbacks and their consequences',()=>{
 for(const chapter of L.CHAPTERS){
   const original=chapter.options.map(key=>({key,onClick:()=>L.outcomeFor(chapter.id,key)}));
   const reordered=L.shuffleChoices(original,()=>0);
   assert.equal(reordered.length,4);
   assert.deepEqual(new Set(reordered),new Set(original));
   const byKey=Object.fromEntries(reordered.map(item=>[item.key,item.onClick()]));
   for(const key of chapter.options)assert.equal(byKey[key],L.outcomeFor(chapter.id,key));
 }
});
test('the RNG produces varied orders while preserving all choices',()=>{
 const letters=['A','B','C','D'];
 const different=L.shuffleChoices(letters,()=>0);
 const unchanged=L.shuffleChoices(letters,()=>.999999);
 assert.notDeepEqual(different,unchanged);
 assert.deepEqual([...different].sort(),[...letters].sort());
});
test('0 and 1-option dialogues still work unchanged',()=>{
 assert.deepEqual(L.shuffleChoices([],()=>0),[]);
 assert.deepEqual(L.shuffleChoices(['OK'],()=>0),['OK']);
});
test('game shuffles when presenting dialogue, not at definition time',()=>{
 assert.match(game,/L\.shuffleChoices\(choices\)\.forEach\(\(c,i\)=>/);
 assert.match(game,/btn\.textContent=\`\$\{i\+1\}\. \$\{c\.text\}\`/);
 assert.match(game,/c\.onClick\(\)/);
});
