// driver.js — full-playthrough regression test.
// Requires script1.js/script2.js (produced by extract.js) to sit next to this
// file, and drives both round1 and round2 from start to ending by always
// picking the FIRST available choice/continue button, reporting how many
// steps it took and whether it actually reached the ending screen.
//
// This does not by itself prove content is "correct" — it proves the state
// machine doesn't crash and always finds a path to an ending. Pair it with
// manual reading of the diff for anything that changes narrative content.
//
// Usage:
//   node extract.js /path/to/build.html   # first, if not already done
//   node driver.js

const path = require('path');
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
console.log('Round1 reached:', panel1(), 'in', guard, 'steps');
if (panel1() !== 'ending') {
  console.error('FAIL: round1 did not reach an ending — stuck in panel:', panel1());
  process.exitCode = 1;
}

elements.secondPlayBtn.click();

function panel2() {
  if (elements.s2Ending.style.display === 'flex') return 'ending';
  if (!elements.s2IntroPanel.hidden) return 'intro';
  if (!elements.s2DecisionPanel.hidden) return 'decision';
  if (!elements.s2AftermathPanel.hidden) return 'aftermath';
  return 'unknown';
}

guard = 0;
while (panel2() !== 'ending' && guard < 100) {
  guard++;
  const p = panel2();
  if (p === 'intro') elements.s2IntroContinueBtn.click();
  else if (p === 'aftermath') elements.s2AftermathContinueBtn.click();
  else if (p === 'decision') elements.s2ChoiceList.children[0].click();
  else break;
}
console.log('Round2 reached:', panel2(), 'in', guard, 'steps');
if (panel2() !== 'ending') {
  console.error('FAIL: round2 did not reach an ending — stuck in panel:', panel2());
  process.exitCode = 1;
}

// Sanity check for the recurring "function-valued title not resolved" bug
// class (found across v6.4/v6.5.1, fixed in v6.5.2): a raw function ever
// ending up as visible text is always a bug, in either round.
function scanForRawFunctionText(el, label) {
  const text = (el._text || '') + (el._html || '');
  if (/function\s*\(|=>/.test(text)) {
    console.error(`FAIL: ${label} appears to contain unresolved function source text:`, text.slice(0, 200));
    process.exitCode = 1;
  }
}
scanForRawFunctionText(elements.eventTitle, 'round1 eventTitle');
scanForRawFunctionText(elements.chronicle, 'round1 chronicle');
scanForRawFunctionText(elements.s2EventTitle, 'round2 s2EventTitle');
scanForRawFunctionText(elements.s2Chronicle, 'round2 s2Chronicle');

if (process.exitCode !== 1) console.log('driver.js: all checks passed.');
