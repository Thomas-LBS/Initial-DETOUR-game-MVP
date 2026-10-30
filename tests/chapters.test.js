const test=require('node:test');
const assert=require('node:assert/strict');
const L=require('../logic');

test('exactly three chapters in the intended order',()=>{
  assert.deepEqual(L.CHAPTERS.map(x=>x.id),['shortcut','photo','rooftop']);
  assert.equal('DECISION_SECONDS' in L,false);
  assert.equal('timeoutOutcome' in L,false);
});
test('every chapter offers four decisions, one in each consequence category',()=>{
  for(const item of L.CHAPTERS){
    assert.equal(item.options.length,4,item.id);
    assert.equal(new Set(item.options).size,4,item.id);
    const kinds=item.options.map(choice=>L.outcomeKind(L.outcomeFor(item.id,choice)));
    assert.deepEqual(kinds,['safe','cooperative','social','danger'],item.id);
    for(const choice of item.options)assert.ok(L.outcomeFor(item.id,choice),`${item.id}: ${choice}`);
    assert.equal('timeout' in item,false,'no chapter should expire');
  }
});
test('bullying story differentiates direct help, teamwork, ridicule and spreading harm',()=>{
  assert.equal(L.outcomeFor('photo','report'),'reported');
  assert.equal(L.outcomeFor('photo','support'),'supported');
  assert.equal(L.outcomeFor('photo','challenge'),'excluded');
  assert.equal(L.outcomeFor('photo','share'),'spread');
  assert.equal(L.outcomeKind('spread'),'danger');
});
test('rooftop offers safe boundary, group alternative, mockery and non-graphic accident',()=>{
  assert.equal(L.outcomeFor('rooftop','stay'),'boundary');
  assert.equal(L.outcomeFor('rooftop','alternative'),'alternative');
  assert.equal(L.outcomeFor('rooftop','leave'),'ridiculed');
  assert.equal(L.outcomeFor('rooftop','climb'),'fall');
});
test('all scenes have a playable path to their friends',()=>{
  for(let idx=0;idx<3;idx++){
    assert.equal(L.canWalk(8,11,idx),true);
    assert.equal(L.canWalk(11,12,idx),true);
    assert.equal(L.canWalk(-1,10,idx),false);
  }
});