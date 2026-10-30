const test=require('node:test');
const assert=require('node:assert/strict');
const L=require('../logic');

test('exactly three chapters in the intended order',()=>{
  assert.deepEqual(L.CHAPTERS.map(x=>x.id),['shortcut','photo','rooftop']);
  assert.equal(L.DECISION_SECONDS,10);
});
test('every chapter offers three decisions and a worst-case timeout',()=>{
  for(const item of L.CHAPTERS){
    assert.equal(item.options.length,3);
    for(const choice of item.options)assert.ok(L.outcomeFor(item.id,choice),`${item.id}: ${choice}`);
    assert.equal(L.timeoutOutcome(item.id),item.timeout);
    assert.equal(L.isCritical(item.timeout),true);
  }
});
test('social bullying outcome is different from physical harm',()=>{
  assert.equal(L.outcomeFor('photo','share'),'spread');
  assert.equal(L.outcomeFor('photo','refuse'),'boundary');
  assert.equal(L.outcomeFor('photo','support'),'support');
  assert.equal(L.timeoutOutcome('photo'),'spread');
});
test('rooftop has a meaningful social boundary and a physical consequence',()=>{
  assert.equal(L.outcomeFor('rooftop','climb'),'fall');
  assert.equal(L.outcomeFor('rooftop','stay'),'boundary');
  assert.equal(L.outcomeFor('rooftop','alternative'),'alternative');
});
test('all scenes have a playable path to their friends',()=>{
  for(let idx=0;idx<3;idx++){
    assert.equal(L.canWalk(8,11,idx),true);
    assert.equal(L.canWalk(11,12,idx),true);
    assert.equal(L.canWalk(-1,10,idx),false);
  }
});