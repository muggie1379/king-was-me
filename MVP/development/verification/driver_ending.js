const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict');
const html=fs.readFileSync(path.join(__dirname,'../KING_WAS_ME_MVP.html'),'utf8');
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]);assert.equal(new Set(ids).size,ids.length);
const scripts=[...html.matchAll(/<script>([^]*?)<\/script>/g)].map(x=>x[1]);
const stub=fs.readFileSync(path.join(__dirname,'domstub.js'),'utf8');
function setup(){
  const pending=new Map();let key=0;const c={console,module:{exports:{}},setInterval:fn=>{pending.set(++key,fn);return key},clearInterval:id=>pending.delete(id)};c.global=c;vm.createContext(c);vm.runInContext(stub,c);
  const get=c.document.getElementById;c.document.getElementById=id=>{assert(ids.includes(id),'Missing ID '+id);return get(id)};
  const exports=['globalThis.r1={events,getState:()=>state,render,choose};','globalThis.r2={events:events2,getState:()=>s,render,choose,continuation};'];
  scripts.forEach((s,i)=>vm.runInContext(s.replace(/\}\)\(\);\s*$/,exports[i]+'})();'),c));return {c,e:c.module.exports.elements,pending};
}
const r1Expected={continue_contact:['平','initiated'],wait_their_move:['次','waited'],lower_priority:['低','reduced'],formal_only:['公式','reduced'],keep_closed:['中断','reduced'],reopen_formal:['再開','initiated'],reopen_informal:['非公式','initiated']};
const r1Text={continue_contact:'평소처럼 동부와의 교류를 이어가기로 했다.',wait_their_move:'다음 접촉은 동부가 먼저 하도록 두었다.',lower_priority:'교류를 유지하되 동부 외교의 우선순위를 낮췄다.',formal_only:'필요한 공식 연락만 유지하기로 했다.',keep_closed:'비공식 교류 중단을 유지했다.',reopen_formal:'공식 교류부터 다시 시작하기로 했다.',reopen_informal:'중단했던 비공식 교류까지 다시 열었다.'};
const labels={initiated:'먼저 움직인 결정',waited:'기다리거나 여지를 둔 결정',reduced:'교류를 줄인 결정'};
for(const [id,[,kind]] of Object.entries(r1Expected))for(const score of [0,12]){
  const {c,e}=setup();const s=c.r1.getState();s.eventIndex=5;s.stage='decision';
  for(const k of ['initiative','pressure','selfProtection','caution','reciprocity'])s[k]=score;
  if(['keep_closed','reopen_formal','reopen_informal'].includes(id))s.choiceHistory.canceled_meeting='pause_contact';
  c.r1.render();const choice=c.r1.events[5].choices(s).find(x=>x.id===id);assert(choice);c.r1.choose(choice,0);e.aftermathContinueBtn.click();
  assert.equal(e.endingLine1.textContent,r1Text[id]);
  assert.match(e.recap.innerHTML,new RegExp(labels[kind]+'<strong>'+(id==='keep_closed'?2:1)+'회'));
  assert.doesNotMatch(e.endingLine1.textContent+e.endingLine2.textContent,/두려움|답을 얻기 위해|문은 닫혔/);
}
let paths=0;
const r2Ids=['continue_normal_real','wait_other_real','lower_priority_real','keep_formal_real','keep_distance_real','reopen_light_real','reopen_direct_real'];
for(const id of r2Ids)for(let result=0;result<2;result++)for(let daily=0;daily<3;daily++)for(let message=0;message<3;message++){
  const {c,e,pending}=setup();e.devSecondPlayBtn.click();let throneLines=0,scene6=false;const selected=[];
  for(let guard=0;guard<100&&e.s2Ending.style.display!=='flex';guard++){
    const state=c.r2.getState(),ev=c.r2.events[state.eventIndex];
    if(!e.s2IntroPanel.hidden)e.s2IntroContinueBtn.click();
    else if(!e.s2AftermathPanel.hidden){
      if(ev.id==='empty_throne'){assert.equal(e.s2AftermathBeats.innerHTML.split('내가 결정하지.').length-1,1);throneLines++}
      e.s2AftermathContinueBtn.click();
    }else if(!e.s2DecisionPanel.hidden){
      const choices=typeof ev.choices==='function'?ev.choices(state):ev.choices;let pick=0;
      if(ev.id==='canceled_plan_real'&&['keep_distance_real','reopen_light_real','reopen_direct_real'].includes(id))pick=choices.findIndex(x=>x.id==='pull_back_real');
      if(ev.id==='quiet_gap_real'){pick=choices.findIndex(x=>x.id===id);scene6=true;if(id==='reopen_light_real')assert.equal(choices[pick].kind,'initiated')}
      if(ev.id==='facing_result_real'){pick=result;assert.equal(e.s2EventDescription.textContent.startsWith(c.r2.continuation(state).scene),true)}
      if(ev.id==='ordinary_day_real')pick=daily;
      if(ev.id==='new_message_real')pick=message;
      if(ev.id==='empty_throne'){assert(e.s2AdvisorHeading.hidden);assert.equal(choices.length,1)}
      assert(pick>=0);selected.push(choices[pick]);e.s2ChoiceList.children[pick].click();
    }else throw Error('No panel');
  }
  const s=c.r2.getState();assert.equal(e.s2Ending.style.display,'flex');assert(scene6);assert.equal(throneLines,1);assert.equal(Object.keys(s.history).length,10);
  assert.equal(s.history.quiet_gap_real,id);assert.equal(e.s2EndingLine1.textContent,c.r2.continuation(s).summary);
  const newChoice=selected.find(x=>x.id===s.history.new_message_real);assert.equal(e.s2EndingLine2.textContent,newChoice.log);
  for(const kind of ['initiated','matched','waited','reduced'])assert.equal(s[kind],selected.filter(x=>x.kind===kind).length);
  assert.equal(pending.size,0);assert.doesNotMatch(e.s2Chronicle.innerHTML,/=>|function\s*\(/);
  e.s2RestartBtn.click();assert.equal(Object.keys(c.r2.getState().history).length,0);assert.equal(c.r2.getState().eventIndex,0);assert.equal(e.s2EventTitle.textContent,c.r2.events[0].title);
  paths++;
}
console.log('driver_ending.js: 14 Round1 endings/counts and '+paths+' complete ending paths PASS');
