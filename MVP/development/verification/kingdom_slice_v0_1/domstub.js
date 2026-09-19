// domstub.js — minimal headless DOM stub sufficient to require() and run
// KING WAS ME's script1.js/script2.js under plain Node, with no browser.
//
// This does NOT try to be a real DOM. It only implements the small surface
// the game's own render()/choose()/etc. code actually touches: textContent,
// innerHTML, classList (backed by a real Set), children via appendChild,
// style/dataset objects, addEventListener + a synthetic .click(), and the
// document/window globals the scripts read at load time.
//
// If a future version of the game touches a DOM API not stubbed here,
// requiring the script will throw "X is not a function" / "Cannot read
// property Y of undefined" at the point of first use — that's expected;
// add the missing surface to El or to the ids list below and re-run.

class El {
  constructor(id) {
    this.id = id;
    this._text = '';
    this._html = '';
    this.children = [];
    this.hidden = false;
    this.classList = {
      _set: new Set(),
      add(c) { this._set.add(c); },
      remove(c) { this._set.delete(c); },
      toggle(c) { this._set.has(c) ? this._set.delete(c) : this._set.add(c); },
      contains(c) { return this._set.has(c); }
    };
    this._listeners = {};
    this.style = {};
    this.dataset = {};
    this.attrs = {};
  }
  set textContent(v) { this._text = v; }
  get textContent() { return this._text; }
  set innerHTML(v) { this._html = v; this.children = []; }
  get innerHTML() { return this._html; }
  appendChild(c) { this.children.push(c); return c; }
  addEventListener(evt, fn) { this._listeners[evt] = this._listeners[evt] || []; this._listeners[evt].push(fn); }
  removeEventListener() {}
  click() { (this._listeners['click'] || []).forEach(fn => fn()); }
  querySelector() { return new El('q'); }
  setAttribute(k, v) { this.attrs[k] = v; }
  getAttribute(k) { return this.attrs[k] ?? null; }
}

// Every element id the game's render() functions look up by getElementById,
// across both round1 and round2. If a future version adds new elements
// (new modal, new panel, etc.), add their ids here — an unlisted id still
// works (getElementById lazily creates one), but listing it up front makes
// missing-element bugs easier to spot in a diff of this file over time.
const ids = [
  // round1 (1회차)
  "progressText", "chapterText", "progressBar", "eventNo", "eventTitle", "eventDescription",
  "introPanel", "decisionPanel", "aftermathPanel", "introBeats", "advisorList", "choiceList", "branchNote",
  "aftermathBeats", "chronicle", "debugPanel", "debugCheck", "introContinueBtn", "aftermathContinueBtn",
  "restartBtn", "ending", "gameLayout", "endingLine1", "endingLine2", "courtExchangeWrap", "courtExchange",
  "sceneArt", "decisionTimer", "timerValue", "timerFill", "silenceModal", "confirmSilenceBtn", "returnDecisionBtn", "recap",
  // round2 (2회차 / Second Reading)
  "s2Shell", "secondPlayBtn", "s2GameLayout", "s2Ending", "s2IntroPanel", "s2DecisionPanel", "s2AftermathPanel",
  "s2IntroBeats", "s2IntroContinueBtn", "s2AftermathBeats", "s2AftermathContinueBtn", "s2ChoiceList", "s2AdvisorList",
  "s2ExchangeWrap", "s2Exchange", "s2Chronicle", "s2DecisionTimer", "s2TimerValue", "s2TimerFill", "s2TimeoutModal",
  "s2TimeoutChoices", "s2SceneArt", "s2EventNo", "s2EventTitle", "s2EventDescription", "s2ProgressText", "s2ChapterText",
  "s2ProgressBar", "s2PhoneTime", "s2PhoneNote", "s2Recap", "s2RestartBtn", "s2BackBtn",
  // dev-only shortcut introduced in v6.5.1 ("DEV ONLY · 2회차 바로 플레이") — remove
  // from this list if/when the dev button itself is removed from the HTML.
  "devSecondPlayBtn"
];

const elements = {};
ids.forEach(id => elements[id] = new El(id));

global.document = {
  getElementById: (id) => elements[id] || (elements[id] = new El(id)),
  createElement: (tag) => new El('created-' + tag),
  querySelector: (sel) => new El('qs:' + sel),
  addEventListener: () => {},
  body: new El('body')
};
global.window = { scrollTo: () => {} };

module.exports = { elements, El };
