const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict');
const html=fs.readFileSync(path.join(__dirname,'../../blind_test/KING_WAS_ME_MVP.html'),'utf8');
const dev=fs.readFileSync(path.join(__dirname,'baseline_v6.5.3.html'),'utf8');
const blocks=[...html.matchAll(/<script>([^]*?)<\/script>/g)];
assert.equal(blocks.length,1);const code=blocks[0][1];new vm.Script(code);
assert.equal(html.match(/  const events = \[[^]*?(?=  function scrollToTop)/)[0].replace(/^\s*\/\/.*$/gm,''),dev.match(/  const events = \[[^]*?(?=  function scrollToTop)/)[0].replace(/^\s*\/\/.*$/gm,''),'Event content changed');
for(const forbidden of ['secondPlayBtn','devSecondPlayBtn','s2Shell','debugPanel','DESIGN NOTE','DEVELOPMENT HISTORY','SECOND READING'])assert(!html.includes(forbidden),forbidden+' remains');
const realIds=new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]));
for(const scenario of ['normal','strong','timeout_silence','timeout_return']){
  delete require.cache[require.resolve('./domstub.js')];const {elements:e}=require('./domstub.js');
  let pending=null;global.setInterval=fn=>{pending=fn;return 1};global.clearInterval=()=>{pending=null};
  const get=document.getElementById;document.getElementById=id=>{assert(realIds.has(id),'Missing ID '+id);return get(id)};
  vm.runInThisContext(code);
  let exercised=false;
  for(let guard=0;guard<100&&e.ending.style.display!=='flex';guard++){
    if(!e.introPanel.hidden)e.introContinueBtn.click();
    else if(!e.aftermathPanel.hidden)e.aftermathContinueBtn.click();
    else if(!e.decisionPanel.hidden){
      if(e.eventTitle.textContent==='취소된 회담'&&scenario.startsWith('timeout')&&!exercised){
        assert(pending);for(let i=0;i<20&&pending;i++)pending();assert(e.silenceModal.classList.contains('open'));
        exercised=true;
        if(scenario==='timeout_silence'){e.confirmSilenceBtn.click();continue}
        e.returnDecisionBtn.click();assert(!e.silenceModal.classList.contains('open'));
      }
      const list=e.choiceList.children;
      let ix=0;if(scenario==='strong'&&e.eventTitle.textContent==='취소된 회담'){
        ix=list.findIndex(x=>/교류.*중단/.test(x.textContent));assert(ix>=0);exercised=true;
      }
      if(scenario==='strong'&&e.eventTitle.textContent==='닫힌 교류')assert.equal(list.length,3);
      list[ix].click();
    }else throw Error('No active panel');
  }
  assert.equal(e.ending.style.display,'flex');
  if(scenario!=='normal')assert(exercised);
  assert.equal(e.eventTitle.textContent,scenario==='strong'?'닫힌 교류':'텅 빈 국경');
  assert.doesNotMatch(e.chronicle.innerHTML,/=>|function\s*\(/);
  e.restartBtn.click();assert.equal(e.eventTitle.textContent,'동부 왕국의 첫 사절');
  console.log('blind '+scenario+': ending, title, restart PASS');
}
console.log('driver_blind.js: one-script build, no dev/second-reading exposure, unchanged events PASS');
