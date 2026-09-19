const {e,active,tick,finish,timed1,assert}=require('./test_helpers.js');
timed1();tick(7);assert.equal(e.timerValue.textContent,'00:13');
e.devSecondPlayBtn.click();assert.equal(active.size,0);
assert.equal(e.s2BackBtn.textContent,'1회차 진행 화면으로 돌아가기');
tick(30);assert(!e.silenceModal.classList.contains('open'));
finish(2);e.s2BackBtn.click();
assert.equal(e.timerValue.textContent,'00:13');assert.equal(active.size,1);
tick(1);assert.equal(e.timerValue.textContent,'00:12');
// Repeated entry keeps remaining time, not a fresh 20-second countdown.
e.devSecondPlayBtn.click();finish(2);e.s2BackBtn.click();
assert.equal(e.timerValue.textContent,'00:12');assert.equal(active.size,1);
tick(12);assert(e.silenceModal.classList.contains('open'));
e.devSecondPlayBtn.click();assert(!e.silenceModal.classList.contains('open'));
finish(2);e.s2BackBtn.click();assert(e.silenceModal.classList.contains('open'));
assert.equal(active.size,0);e.confirmSilenceBtn.click();finish(1);
e.secondPlayBtn.click();assert.equal(e.s2BackBtn.textContent,'1회차 엔딩으로 돌아가기');
finish(2);e.s2BackBtn.click();assert.equal(e.ending.style.display,'flex');
assert.equal(active.size,0);
console.log('driver_transition.js: pause/resume, repeated entry, modal restoration, normal ending return PASS');
