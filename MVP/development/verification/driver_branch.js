const {e,finish,assert}=require('./test_helpers.js');
function chooseMatch(pattern,list){const i=list.findIndex(x=>pattern.test(x.textContent));assert(i>=0,'Branch choice missing');return i}
finish(1,(title,list)=>title==='취소된 회담'?chooseMatch(/교류.*중단/,list):0);
assert.equal(e.eventTitle.textContent,'닫힌 교류');
assert.match(e.chronicle.innerHTML,/닫힌 교류/);assert.doesNotMatch(e.chronicle.innerHTML,/=>|function\s*\(/);
e.secondPlayBtn.click();
finish(2,(title,list)=>title==='취소된 약속'?chooseMatch(/당분간.*거리/,list):0);
assert.equal(e.s2EventTitle.textContent,'빈 왕좌');
assert.match(e.s2Chronicle.innerHTML,/내가 만든 거리/);assert.doesNotMatch(e.s2Chronicle.innerHTML,/=>|function\s*\(/);
console.log('driver_branch.js: both strong branches and resolved chronicle titles PASS');
