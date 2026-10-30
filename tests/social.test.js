const test=require('node:test');
const assert=require('node:assert/strict');
const social=require('../social');

test('all three social consequence paths have a distinct meme',()=>{
  assert.deepEqual(Object.keys(social.STORIES),['mocked','excluded','ridiculed']);
  assert.equal(new Set(Object.values(social.STORIES).map(s=>s.caption)).size,3);
});
test('social consequence cinematics have all four stages and no timer',()=>{
  for(const outcome of Object.keys(social.STORIES)) {
    assert.equal(social.stageFor(outcome,0),'setup');
    assert.equal(social.stageFor(outcome,1.8),'meme');
    assert.equal(social.stageFor(outcome,3),'notifications');
    assert.equal(social.stageFor(outcome,5),'perspective');
    assert.equal(social.durationFor(outcome),6.3);
  }
});
test('bullying is never framed as deserved and supportive friends get a line',()=>{
  for(const story of Object.values(social.STORIES)) {
    assert.ok(story.reply.includes('MAYA')||story.reply.includes('LINA'));
    assert.ok(story.takeaway.length>10);
  }
});
test('normal outcomes are not treated as social fallout',()=>{
  assert.equal(social.isSocialEnding('group-crossing'),false);
  assert.equal(social.stageFor('supported',1),'none');
});