// driver_timeout.js — exercises the timed decision event (round2's
// "canceled_plan_real" / 취소된 약속, ~20s timer) without waiting real time.
//
// Overrides global.setInterval/clearInterval BEFORE requiring the game
// scripts, captures the tick callback the game registers, then invokes it
// synchronously ~20 times to simulate 20 seconds passing. Confirms the
// timeout swaps in the 3 replacement choices (no "return and decide now"
// escape hatch — that pattern is intentionally round1-only; round2's timeout
// is a harder cut, see 00_START_HERE.md's design-principles section).
//
// NOTE: this driver navigates round2 by matching on the on-screen event
// title text ("취소된 약속"). If a future version renames this event, or
// changes which event index has the timer, update the title string(s) below
// (or adapt to check ev.id via a debug hook) rather than assuming the test
// still covers the right event.
//
// Usage:
//   node extract.js /path/to/build.html   # first, if not already done
//   node driver_timeout.js

const path = require('path');

let pending = null;
global.setInterval = (fn, ms) => { pending = fn; return 1; };
global.clearInterval = (id) => { pending = null; };

const { elements } = require(path.join(__dirname, 'domstub.js'));
require(path.join(__dirname, 'script1.js'));
require(path.join(__dirname, 'script2.js'));

function panel1() {
  if (elements.ending.style.display === 'flex') return 'ending';
  if (!elements.introPanel.hidden) return 'intro';
  if (!elements.decisionPanel.hidden) return 'decision';
  if (!elements.aftermathPanel.hidden) return 'aftermath';
  return 'unknown';
}
let guard = 0;
while (panel1() !== 'ending' && guard < 200) {
  guard++;
  const p = panel1();
  if (p === 'intro') elements.introContinueBtn.click();
  else if (p === 'aftermath') elements.aftermathContinueBtn.click();
  else if (p === 'decision') elements.choiceList.children[0].click();
  else break;
}
elements.secondPlayBtn.click();

function panel2() {
  if (elements.s2Ending.style.display === 'flex') return 'ending';
  if (!elements.s2IntroPanel.hidden) return 'intro';
  if (!elements.s2DecisionPanel.hidden) return 'decision';
  if (!elements.s2AftermathPanel.hidden) return 'aftermath';
  return 'unknown';
}

// Advance until we reach the timed event's decision screen.
const TIMED_EVENT_TITLE = '취소된 약속';
guard = 0;
while (guard < 50) {
  guard++;
  const p = panel2();
  if (p === 'intro') {
    if (elements.s2EventTitle._text === TIMED_EVENT_TITLE) { elements.s2IntroContinueBtn.click(); break; }
    elements.s2IntroContinueBtn.click();
  } else if (p === 'aftermath') {
    elements.s2AftermathContinueBtn.click();
  } else if (p === 'decision') {
    if (elements.s2EventTitle._text === TIMED_EVENT_TITLE) break;
    elements.s2ChoiceList.children[0].click();
  } else break;
}
console.log('Now at event:', elements.s2EventTitle._text, 'panel:', panel2());
if (elements.s2EventTitle._text !== TIMED_EVENT_TITLE) {
  console.error(`FAIL: never reached the timed event ("${TIMED_EVENT_TITLE}") — event navigation logic or title may have changed.`);
  process.exitCode = 1;
}
console.log('Timer pending callback registered:', !!pending);
if (!pending) {
  console.error('FAIL: no setInterval callback was captured — timer wiring may have changed.');
  process.exitCode = 1;
}

// Simulate 20 seconds passing.
for (let i = 0; i < 20 && pending; i++) { pending(); }

const modalOpen = elements.s2TimeoutModal.classList.contains('open');
const timeoutChoiceTexts = elements.s2TimeoutChoices.children.map(c => c._text);
console.log('s2TimeoutModal open:', modalOpen);
console.log('timeout choice count:', elements.s2TimeoutChoices.children.length);
console.log('timeout choice texts:', timeoutChoiceTexts);

if (!modalOpen || elements.s2TimeoutChoices.children.length !== 3) {
  console.error('FAIL: timeout did not populate replacement choices.');
  process.exitCode = 1;
}
// Design rule: round2's timeout is a hard cut with NO "지금 결정한다"-style
// return/undo button (unlike round1's silenceModal). Flag if one reappears.
if (timeoutChoiceTexts.some(t => /지금\s*결정/.test(t))) {
  console.error('FAIL: a "결정하기" return/undo choice appeared in round2 timeout — this contradicts the no-escape-hatch design rule. Confirm this was an intentional design change before accepting.');
  process.exitCode = 1;
}

elements.s2TimeoutChoices.children[0].click();
console.log('panel after timeout choice click:', panel2());

guard = 0;
while (panel2() !== 'ending' && guard < 50) {
  guard++;
  const p = panel2();
  if (p === 'intro') elements.s2IntroContinueBtn.click();
  else if (p === 'aftermath') elements.s2AftermathContinueBtn.click();
  else if (p === 'decision') elements.s2ChoiceList.children[0].click();
  else break;
}
console.log('Final panel:', panel2(), 'steps after timeout:', guard);
if (panel2() !== 'ending') {
  console.error('FAIL: did not reach ending after timeout path.');
  process.exitCode = 1;
}

if (process.exitCode !== 1) console.log('driver_timeout.js: all checks passed.');
