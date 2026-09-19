const fs = require('fs');
const path = require('path');
const assert = require('assert/strict');
const active = new Map();
let next = 0;
global.setInterval = fn => { active.set(++next, fn); return next; };
global.clearInterval = id => active.delete(id);
const {elements:e} = require('./domstub.js');
const html=fs.readFileSync(path.join(__dirname,'../KING_WAS_ME_MVP.html'),'utf8');
const ids=new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]));
const get=document.getElementById;
document.getElementById=id=>{assert(ids.has(id),'Missing real HTML ID: '+id);return get(id)};
require('./script1.js'); require('./script2.js');
function tick(n){for(let i=0;i<n;i++)for(const [id,fn] of [...active])if(active.has(id))fn()}
function advance(round, pick=()=>0){
  const p=round===1?'':'s2';
  const id=name=>p ? p+name[0].toUpperCase()+name.slice(1) : name;
  if(e[id('ending')].style.display==='flex')return false;
  if(!e[id('introPanel')].hidden)e[id('introContinueBtn')].click();
  else if(!e[id('aftermathPanel')].hidden)e[id('aftermathContinueBtn')].click();
  else if(!e[id('decisionPanel')].hidden){
    const list=e[id('choiceList')].children;
    const ix=pick(e[id('eventTitle')].textContent,list);
    assert(list[ix],'Expected choice missing');list[ix].click();
  }else throw Error('No active panel');
  return true;
}
function finish(round,pick){for(let i=0;i<100;i++)if(!advance(round,pick))return;throw Error('Did not finish')}
function timed1(){for(let i=0;i<100;i++){
  if(e.eventTitle.textContent==='취소된 회담'&&!e.decisionPanel.hidden)return;
  advance(1);
}throw Error('Timed scene not reached')}
module.exports={e,active,tick,advance,finish,timed1,assert};
