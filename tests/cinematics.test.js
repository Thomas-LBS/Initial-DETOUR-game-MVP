const test=require('node:test');
const assert=require('node:assert/strict');
const C=require('../cinematics');
test('each serious ending has extended cinematic duration',()=>{
 for(const key of ['collision','fall','spread']){assert.ok(C.durationFor(key)>=4.5);assert.ok(C.durationFor(key)>C.impactAt(key));}
});
test('all three endings reach their intended final stage',()=>{
 assert.equal(C.frameFor('collision',4),'aftermath');
 assert.equal(C.frameFor('fall',4),'aftermath');
 assert.equal(C.frameFor('spread',4),'silence');
});
test('the bullying effect shows viral spread and then its impact',()=>{
 assert.deepEqual([0,1.5,3,4].map(t=>C.frameFor('spread',t)),['sending','viral','overload','silence']);
});
test('unrelated outcomes stay unchanged',()=>{assert.equal(C.frameFor('supported',2),'none');assert.equal(C.durationFor('supported'),3);});
