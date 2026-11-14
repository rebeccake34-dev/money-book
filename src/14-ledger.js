/* kind: cash | future | count | bad-cash | bad-future */
const BUILTIN=[
 {id:"meal",kind:"cash",name:"自己带饭，不点外卖",val:13,why:"外卖一顿约 $20，自己做约 $7"},
 {id:"nosugar",kind:"cash",name:"忍住没买含糖饮料",val:8,why:"直接省下一杯的钱（按 $8 估）"},
 {id:"snack",kind:"cash",name:"忍住没买零食",val:4,why:"按一次 $4 估"},
 {id:"alcohol",kind:"cash",name:"少喝一杯酒",val:13,why:"酒吧一杯约 $12–15，按你常去的价格改"},
 {id:"walk",kind:"cash",name:"短距离走路，不打车不坐车",val:4,why:"按一次车费 $4 估，改成你的实际车费"},
 {id:"coffee",kind:"cash",name:"自己泡咖啡，不买外带",val:5.5,why:"一杯外带咖啡约 $5–6"},
 {id:"water",kind:"cash",name:"自带水瓶，不买瓶装水",val:3.5,why:"一瓶约 $3–4"},
 {id:"nobuy",kind:"cash",ask:true,name:"想买的东西等了 48 小时，最后没买",val:0,askLabel:"没买的东西多少钱？",why:"每次自己填那件东西的价格"},
 {id:"subcancel",kind:"cash",ask:true,mult:12,name:"取消了一个不用的订阅",val:0,askLabel:"这个订阅每月多少钱？会按一年 12 个月计入",why:"每次自己填月费，按一年 12 个月计入"},
 {id:"floss",kind:"future",name:"用牙线 / 认真刷牙",val:1.5,why:"十年内少做一颗根管 + 牙冠（约 $4,650）和 3 次补牙（约 $930），共约 $5,580 ÷ 3,650 天"},
 {id:"sun",kind:"future",grp:"aes",link:"sun",name:"出门涂防晒",val:0},
 {id:"sleep",kind:"future",grp:"aes",link:"sleep",name:"23 点前睡觉",val:0},
 {id:"protein",kind:"future",grp:"aes",link:"protein",name:"蛋白质吃够了",val:0},
 {id:"shades",kind:"future",grp:"aes",link:"shades",name:"出门戴墨镜 / 帽子",val:0},
 {id:"cleanse",kind:"future",grp:"aes",link:"cleanse",name:"晚上认真卸妆洁面",val:0},
 {id:"nophone",kind:"future",grp:"aes",link:"nophone",name:"睡前一小时不刷手机",val:0},
 {id:"train",kind:"future",grp:"aes",link:"train",name:"完成一次训练",val:0},
 {id:"pace",kind:"future",grp:"aes",link:"pace",name:"本周减脂节奏稳（掉秤不超过体重 1%）",val:0,weekly:true},
 {id:"warmup",kind:"future",name:"训练前热身、动作做标准",val:0.7,why:"十年内少两次腰背物理治疗（共约 $1,440）÷ 约 2,000 次训练"},
 {id:"stretch",kind:"future",name:"训练后拉伸放松",val:0.35,why:"同热身的算法，按一半贡献算"},
 {id:"stand",kind:"future",name:"久坐一小时后起来活动",val:0.15,why:"每五年少一次腰背治疗（约 $720）÷ 约 5,000 次"},
 {id:"feet",kind:"future",name:"站着工作穿支撑鞋、下班拉伸小腿",val:0.4,why:"十年内少看约 10 次足科（每次按 $100 估，共约 $1,000）÷ 约 2,500 个工作日"},
 {id:"eyes",kind:"future",name:"看屏幕 20 分钟远眺 20 秒",val:0.05,why:"主要好处是减少眼疲劳，金额按很低估算"},
 {id:"checkup",kind:"future",name:"按时洗牙 / 体检",val:150,why:"早发现问题：一次补牙（约 $310）比根管 + 牙冠便宜很多，按每次避免约半次补牙费估"},
 {id:"noprocrast",kind:"count",name:"今天没拖延，完成了一件挂着的事",val:0,why:"情绪上的好处很难换算成钱，只记次数"},
 {id:"saidno",kind:"count",name:"拒绝了一件不想做的事",val:0,why:"只记次数"},
 {id:"study",kind:"count",name:"学习了 30 分钟",val:0,why:"备考、准备面试等；长期回报很大，但没法按次算钱，只记次数"},
 {id:"connect",kind:"count",name:"主动联系了一个朋友或家人",val:0,why:"只记次数"},
 {id:"win",kind:"count",name:"写下了今天做成的一件事",val:0,why:"对抗内耗和自我怀疑，只记次数"},
 {id:"b-sugar",kind:"bad-cash",name:"买了奶茶 / 含糖饮料",val:8,why:"按一杯 $8 扣"},
 {id:"b-meal",kind:"bad-cash",name:"点了外卖",val:13,why:"跟自己带饭比，多花约 $13"},
 {id:"b-snack",kind:"bad-cash",name:"买了零食",val:4,why:"按一次 $4 扣"},
 {id:"b-sleep",kind:"bad-future",link:"sleep",name:"熬夜过了 0 点",val:0},
 {id:"b-pace",kind:"bad-future",link:"pace",name:"这周掉秤太快（超过体重 1%）",val:0,weekly:true},
 {id:"b-warm",kind:"bad-future",name:"训练没热身就上重量",val:0.7,why:"跟热身同一个算法，反过来扣"}
];
const GROUPS=[
 {id:"cash",title:"当场省下钱",hint:"真的留在你手里的钱"},
 {id:"aes",title:"健康 · 外貌习惯",hint:"按你的价格清单换算"},
 {id:"future",title:"以后少花钱",hint:"估算的少损失"},
 {id:"count",title:"情绪和时间",hint:"只记次数"},
 {id:"bad",title:"坏习惯",hint:"会从总数里扣掉"}
];
const BASE_MS=[{name:"一次物理治疗复诊",amt:97},{name:"一次洗牙检查",amt:300},{name:"一次补牙",amt:310},{name:"一个疗程的腰背物理治疗",amt:720},{name:"一颗牙冠",amt:2250},{name:"一次根管 + 牙冠",amt:4650}];
const AES_DEFAULT={botox:800,botoxN:3,sculptra:1350,sculptraN:1,ulthera:900,ultheraLines:300,ultheraN:1};
// share of an item's yearly cost credited to each linked habit, and how often that habit happens
const LINKS={
 sun:{label:"防晒",pct:40,per:365,unit:"365 天",why:"紫外线是皮肤老化最大的外因"},
 sleep:{label:"早睡",pct:15,per:365,unit:"365 天",why:"睡眠影响皮肤和整体状态"},
 protein:{label:"蛋白质",pct:10,per:365,unit:"365 天",why:"支持肌肉和皮肤修复"},
 train:{label:"训练",pct:10,per:208,unit:"每年约 208 次训练（每周 4 次）",why:"保持体态和身体机能"},
 shades:{label:"墨镜 / 帽子",pct:10,per:365,unit:"365 天",why:"少眯眼、少晒眼周"},
 cleanse:{label:"卸妆洁面",pct:5,per:365,unit:"365 天",why:"减少闭口和痘痘"},
 nophone:{label:"睡前不刷手机",pct:5,per:365,unit:"365 天",why:"提高睡眠质量"},
 pace:{label:"减脂节奏",pct:30,per:52,unit:"52 周，每周记一次",why:"减脂太快容易让脸部凹陷、皮肤松"}
};
const TYPE_LINKS={botox:["sun","sleep","train","shades","cleanse","nophone"],fill:["sleep","protein","train","cleanse","nophone","pace"],lift:["sun","sleep","protein","train","cleanse","nophone","pace"],other:["sleep","train","cleanse","nophone"]};
function aesItems(a){
  a=a||settings.aes;
  const raw=Array.isArray(a.items)?a.items:[
    {id:"botox",name:"护理项目 1",type:"botox",price:+a.botox||0,n:+a.botoxN||0},
    {id:"sculptra",name:"护理项目 2",type:"fill",price:+a.sculptra||0,n:+a.sculptraN||0},
    {id:"ulthera",name:"护理项目 3",type:"lift",price:+a.ulthera||0,n:+a.ultheraN||0}];
  return raw.map(it=>Array.isArray(it.links)?it:{...it,links:TYPE_LINKS[it.type]||TYPE_LINKS.other});
}
const itemYear=it=>(+it.price||0)*(+it.n||0);
function aesYear(a){const y={all:0};aesItems(a).forEach(it=>y.all+=itemYear(it));return y}
function linkedItems(k){return aesItems().filter(it=>it.links.includes(k)&&itemYear(it)>0)}
function linkVal(k){const L=LINKS[k];const sum=linkedItems(k).reduce((a,it)=>a+itemYear(it),0);return Math.round(sum*L.pct/100/L.per*100)/100}
function linkWhy(k){const L=LINKS[k],its=linkedItems(k);
  return its.length?`${L.why}；按「${its.map(i=>i.name||"未命名").join("、")}」每年花费的 ${L.pct}% ÷ ${L.unit}`:`在「你的价格清单」里还没有项目勾选「${L.label}」，所以暂时是 $0`}
function milestones(){return [...BASE_MS,...aesItems().filter(it=>+it.price>0&&it.name).map(it=>({name:"一次"+it.name,amt:+it.price}))].sort((x,y)=>x.amt-y.amt)}
const KIND_LABEL={"cash":"当场省","future":"以后少花","count":"只记次数","bad-cash":"坏·当场多花","bad-future":"坏·以后多花"};

const $=id=>document.getElementById(id);
const fx=()=>1;
const sym=()=>settings.cur==="CNY"?"¥":"$";
const curName=()=>settings.cur==="CNY"?"人民币":"AUD";
const money=n=>(n<0?"−":"")+sym()+(Math.abs(n)*fx()).toFixed(2);
const r2=n=>Math.round(n*100)/100;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const dayKey=d=>{const z=new Date(d.getTime()-d.getTimezoneOffset()*60000);return z.toISOString().slice(0,10)};
const parseDay=k=>{const [y,m,d]=k.split("-").map(Number);return new Date(y,m-1,d)};
const addDays=(k,n)=>{const d=parseDay(k);d.setDate(d.getDate()+n);return dayKey(d)};
const today=()=>dayKey(new Date());
const weekStart=k=>{const d=parseDay(k);const w=(d.getDay()+6)%7;d.setDate(d.getDate()-w);return dayKey(d)};

let settings={vals:{},custom:[],transfers:{},aes:{...AES_DEFAULT},hidden:[],groups:[],hiddenGroups:[],cur:"AUD",rate:4.68};
let manage=false;  // transfers: {"2026-11-02": 34.5}
let days={};
let amts={};   // {"2026-11-04": {nobuy:[45,20]}}
let notes=[]; // [{id,text,at}]
let db=null, uid=null, mode="loading";
const pending={};

function habits(){
  return [...BUILTIN,...settings.custom].map(h=>h.link?{...h,val:linkVal(h.link),why:linkWhy(h.link)+(h.kind.startsWith("bad")?"，反过来扣":"")}:{...h,val:settings.vals[h.id]??h.val});
}
function hMap(){return Object.fromEntries(habits().map(h=>[h.id,h]))}
// signed value of one occurrence, split into cash / future
function effect(h){
  if(h.kind==="cash")return {cash:h.val,fut:0};
  if(h.kind==="future")return {cash:0,fut:h.val};
  if(h.kind==="bad-cash")return {cash:-h.val,fut:0};
  if(h.kind==="bad-future")return {cash:0,fut:-h.val};
  return {cash:0,fut:0};
}
function sumDays(keys,map){
  let cash=0,fut=0;const per={};
  for(const k of keys){const c=days[k];if(!c)continue;
    for(const [id,n] of Object.entries(c)){const h=map[id];if(!h||!n)continue;const e=effect(h);
      let cv=e.cash*n,fv=e.fut*n;
      if(h.ask){const tot=(amts[k]?.[id]||[]).reduce((a,b)=>a+b,0),sg=h.kind.startsWith("bad")?-1:1;
        if(h.kind.endsWith("cash")){cv=sg*tot;fv=0}else{fv=sg*tot;cv=0}}
      cash+=cv;fut+=fv;per[id]=(per[id]||0)+cv+fv}}
  return {cash,fut,net:cash+fut,per};
}
function weekKeys(ws){return Array.from({length:7},(_,i)=>addDays(ws,i))}

// streaks
function firstDay(){const ks=Object.keys(days).filter(k=>Object.values(days[k]||{}).some(n=>n>0)).sort();return ks[0]||null}
function streakText(h){
  const t=today();
  const has=k=>(days[k]?.[h.id]||0)>0;
  if(h.kind.startsWith("bad")){
    const f=firstDay(); if(!f)return "";
    if(has(t))return "今天发生了";
    let k=addDays(t,-1),n=1;
    while(k>=f&&!has(k)){n++;k=addDays(k,-1)}
    return `已经 ${n} 天没有`;
  }
  let k=has(t)?t:addDays(t,-1),n=0;
  while(has(k)){n++;k=addDays(k,-1)}
  if(!n)return "";
  return has(t)?`连续 ${n} 天`:`连续 ${n} 天，今天还没做`;
}

// ---------- render ----------
function render(){
  const map=hMap(),t=today(),ws=weekStart(t);
  const all=sumDays(Object.keys(days),map), wk=sumDays(weekKeys(ws),map), dy=sumDays([t],map);
  $("wNet").textContent=money(wk.net); $("dNet").textContent=money(dy.net);
  $("wCash").textContent=money(wk.cash); $("wFut").textContent=money(wk.fut);
  $("aCash").textContent="累计 "+money(all.cash); $("aFut").textContent="累计 "+money(all.fut);
  const done=settings.transfers[ws], totalT=Object.values(settings.transfers).reduce((a,b)=>a+b,0);
  if(done!=null){$("saveText").innerHTML=`本周已转入储蓄 <b class="num">${money(done)}</b> · 累计已转入 <b class="num">${money(totalT)}</b>`;$("saveBtn").textContent="撤销";$("saveBtn").disabled=false}
  else if(wk.cash>0){$("saveText").innerHTML=`本周当场省下 <b class="num">${money(wk.cash)}</b>，可以转进储蓄`+(totalT?` · 累计已转入 <b class="num">${money(totalT)}</b>`:"");$("saveBtn").textContent=`已转入 ${money(wk.cash)}`;$("saveBtn").disabled=false}
  else{$("saveText").textContent="本周还没有当场省下的钱。"+(totalT?` 累计已转入 ${money(totalT)}`:"");$("saveBtn").textContent="已转入";$("saveBtn").disabled=true}

  // tiles
  const c=days[t]||{}, hidden=new Set(settings.hidden||[]), all0=habits(), hs=all0.filter(h=>!hidden.has(h.id));
  $("groups").innerHTML="";
  const wrap=document.createElement("div");wrap.style.cssText="display:flex;flex-direction:column;gap:18px";
  const bar=document.createElement("div");bar.className="manage-bar";
  bar.innerHTML=manage?`<span>可以删除习惯或整个板块，也可以在最下面新增板块</span>`:`<span></span>`;
  const visG=allGroups().filter(g=>!(settings.hiddenGroups||[]).includes(g.id));
  const allOpen=visG.every(g=>!isCollapsed(g.id));
  const tb=document.createElement("button");tb.type="button";tb.className="btn";tb.textContent=allOpen?"全部收起":"全部展开";
  tb.onclick=()=>{setCollapsed(allOpen?visG.map(g=>g.id):[]);render()};
  if(!manage){bar.innerHTML="";bar.appendChild(tb)}
  const mb=document.createElement("button");mb.type="button";mb.className="btn"+(manage?" primary":"");mb.textContent=manage?"完成":"管理习惯";
  mb.onclick=()=>{manage=!manage;render()};bar.appendChild(mb);wrap.appendChild(bar);
  const hidG=new Set(settings.hiddenGroups||[]);
  allGroups().filter(g=>!hidG.has(g.id)).forEach(g=>{
    const list=hs.filter(h=>groupOf(h)===g.id);
    if(!list.length&&!g.custom&&!manage)return;
    const sec=document.createElement("div");sec.className="group";
    const closed=isCollapsed(g.id);
    const dsum=sumDays([t],map);let gn=0,gm=0;list.forEach(h=>{gn+=c[h.id]||0;gm+=dsum.per[h.id]||0});
    const sumTxt=gn?`今天 ${gn} 次`+(gm?` · ${gm>0?"+":""}${money(gm)}`:""):"今天还没记";
    sec.innerHTML=`<div class="group-head"><button type="button" class="gtoggle" aria-expanded="${!closed}"><span class="chev" aria-hidden="true">${closed?"▸":"▾"}</span><span class="gtitle">${esc(g.title)}</span><span class="ghint">${esc(g.hint||"")}</span><span class="gsum num" style="color:${!gn?"var(--muted)":gm<0?"var(--bad)":"var(--accent)"}!important">${sumTxt}</span></button></div><div class="tiles"${closed?" hidden":""}></div>`;
    sec.querySelector(".gtoggle").onclick=()=>{const cur=getCollapsed();setCollapsed(closed?cur.filter(x=>x!==g.id):[...cur,g.id]);render()};
    if(manage){const db_=document.createElement("button");db_.type="button";db_.className="btn danger";db_.style.marginLeft="auto";db_.textContent="删除板块";db_.onclick=()=>hideGroup(g);sec.querySelector(".group-head").appendChild(db_)}
    if(!list.length&&!closed){const e=document.createElement("p");e.className="note";e.style.margin="0";e.textContent="这个板块还没有习惯。在「设置」页的「添加自己的习惯」里选这个板块就能加进来。";sec.appendChild(e)}
    const grid=sec.querySelector(".tiles");
    list.forEach(h=>{
      const n=c[h.id]||0, bad=h.kind.startsWith("bad");
      const cls=bad?"k-bad":"k-"+h.kind;
      const unit=h.weekly?"每周":"每次";const cp=h.id==="protein"&&window.__cutProtein?window.__cutProtein():null;const valText=cp?`${unit} +${money(h.val)} · 今天 ${cp.pro}/${cp.target} g`:h.kind==="count"?"记一次":h.ask?(n?`今天共 ${money(((amts[t]?.[h.id])||[]).reduce((a,b)=>a+b,0))}`:"每次自己填金额"):bad?`${unit}扣 ${money(h.val)}`:`${unit} +${money(h.val)}`;
      const b=document.createElement("button");b.type="button";b.className="tile "+cls;b.dataset.h=h.id;
      b.innerHTML=`<span class="cnt" ${n?"":"data-zero"}>${n?"×"+n:"今天 0"}</span><b>${esc(h.name)}</b><span class="val">${valText}</span><span class="streak">${streakText(h)}</span>`;
      if(manage){b.classList.add("managing");b.querySelector(".streak").innerHTML=`<span class="del-chip">删除</span>`;
        b.onclick=()=>hideHabit(h);b.setAttribute("aria-label","删除 "+h.name);grid.appendChild(b);return}
      b.onclick=()=>h.ask?openAsk(h):log(h,1);
      if(n){const u=document.createElement("button");u.type="button";u.className="undo";u.textContent="撤销一次";u.onclick=e=>{e.stopPropagation();log(h,-1)};b.appendChild(u)}
      grid.appendChild(b);
    });
    wrap.appendChild(sec);
  });
  if(manage){
    const f=document.createElement("form");f.className="card add-grp";f.noValidate=true;
    f.innerHTML=`<h3>新增板块</h3><div class="form"><label>板块名称<input id="grpName" type="text" maxlength="20" placeholder="例如：学习成长"></label><label>说明（可不填）<input id="grpHint" type="text" maxlength="30" placeholder="例如：只记次数"></label><div class="full" style="display:flex;gap:10px;align-items:center"><button class="btn primary" type="submit">添加板块</button><span class="formmsg" id="grpMsg"></span></div></div>`;
    f.addEventListener("submit",e=>{e.preventDefault();const name=f.querySelector("#grpName").value.trim(),hint=f.querySelector("#grpHint").value.trim();
      if(!name){f.querySelector("#grpMsg").textContent="请填写板块名称。";return}
      if(allGroups().some(g=>g.title===name)){f.querySelector("#grpMsg").textContent="已经有同名的板块了。";return}
      settings={...settings,groups:[...(settings.groups||[]),{id:"g_"+Date.now().toString(36),title:name,hint,custom:true}]};
      renderGrpSelect();render();saveSettings();toast(`已添加板块「${name}」`)});
    wrap.appendChild(f);
  }
  const goneG=allGroups().filter(g=>hidG.has(g.id));
  if(goneG.length){
    const d=document.createElement("details");d.className="card";if(manage)d.open=true;
    d.innerHTML=`<summary>已删除的板块（${goneG.length}）</summary><div class="gone"></div><p class="note">删除板块会把里面的习惯一起隐藏，过去的记录还会计入总数。</p>`;
    const box=d.querySelector(".gone");
    goneG.forEach(g=>{const r=document.createElement("div");r.className="gone-row";r.innerHTML=`<span>${esc(g.title)}</span>`;
      const rb=document.createElement("button");rb.type="button";rb.className="btn";rb.textContent="恢复";rb.onclick=()=>restoreGroup(g);r.appendChild(rb);box.appendChild(r)});
    wrap.appendChild(d);
  }
  const gone=all0.filter(h=>hidden.has(h.id)&&!hidG.has(groupOf(h)));
  if(gone.length){
    const d=document.createElement("details");d.className="card";if(manage)d.open=true;
    d.innerHTML=`<summary>已删除的习惯（${gone.length}）</summary><div class="gone"></div><p class="note">删除只是不再显示，过去的记录还会计入总数。点「恢复」可以加回来。</p>`;
    const box=d.querySelector(".gone");
    gone.forEach(h=>{const r=document.createElement("div");r.className="gone-row";r.innerHTML=`<span>${esc(h.name)}</span>`;
      const rb=document.createElement("button");rb.type="button";rb.className="btn";rb.textContent="恢复";rb.onclick=()=>restoreHabit(h);r.appendChild(rb);box.appendChild(r)});
    wrap.appendChild(d);
  }
  $("groups").appendChild(wrap);

  // milestones on all-time net
  {const its=aesItems().filter(it=>+it.price>0&&it.name);$("lines").textContent=all.net>0&&its.length?"累计净省下的钱够做："+its.map(it=>`${it.name} ${Math.floor(all.net/it.price)} 次`).join(" · "):""}
  $("ms").innerHTML=milestones().map(m=>{const p=Math.max(0,Math.min(1,all.net/m.amt));
    return `<div class="ms-row"><div class="ms-top"><span>${m.name}（${money(m.amt)}）</span><span class="num ${p>=1?"done":""}">${p>=1?"✓ 已够":Math.round(p*100)+"%"}</span></div><div class="bar"><span style="width:${p*100}%"></span></div></div>`}).join("");

  renderChart(map);
}

// ---------- weekly chart ----------
let selWeek=null;
function renderChart(map){
  const t=today(), cur=weekStart(t);
  const weeks=Array.from({length:8},(_,i)=>addDays(cur,-7*(7-i)));
  const data=weeks.map(w=>({w,...sumDays(weekKeys(w),map)}));
  if(!selWeek||!weeks.includes(selWeek))selWeek=cur;
  const W=600,H=220,L=48,R=8,T=14,B=30;
  const F=fx();const maxV=Math.max(10,...data.map(d=>d.net*F)), minV=Math.min(0,...data.map(d=>d.net*F));
  const step=niceStep((maxV-minV)/4);
  const top=Math.ceil(maxV/step)*step, bot=Math.floor(minV/step)*step;
  const y=v=>T+(top-v)/(top-bot)*(H-T-B);
  const colW=(W-L-R)/8, bw=Math.min(36,colW*.55);
  let s="";
  for(let v=bot;v<=top+1e-9;v+=step){
    s+=`<line x1="${L}" x2="${W-R}" y1="${y(v)}" y2="${y(v)}" stroke="var(--line)" stroke-width="${v===0?1.5:1}"/>`;
    s+=`<text x="${L-6}" y="${y(v)+4}" text-anchor="end" font-size="11" fill="var(--muted)" font-family="var(--mono)">${sym()}${Math.round(v)}</text>`;
  }
  data.forEach((d,i)=>{
    const cx=L+colW*i+colW/2, y0=y(0), y1=y(d.net*F), h=Math.abs(y1-y0);
    const neg=d.net<0, isSel=d.w===selWeek, isCur=d.w===cur;
    const fill=neg?"var(--bad)":"var(--accent)";
    if(h>0.5){
      const r=Math.min(4,h,bw/2);
      // rounded data-end, square at baseline
      const x=cx-bw/2;
      const path=neg
        ?`M${x},${y0} H${x+bw} V${y1-r} Q${x+bw},${y1} ${x+bw-r},${y1} H${x+r} Q${x},${y1} ${x},${y1-r} Z`
        :`M${x},${y0} V${y1+r} Q${x},${y1} ${x+r},${y1} H${x+bw-r} Q${x+bw},${y1} ${x+bw},${y1+r} V${y0} Z`;
      s+=`<path d="${path}" fill="${fill}" opacity="${isSel?1:.55}"/>`;
    }
    const md=parseDay(d.w);
    s+=`<text x="${cx}" y="${H-10}" text-anchor="middle" font-size="11" fill="${isSel?"var(--ink)":"var(--muted)"}" font-weight="${isSel?700:400}">${isCur?"本周":(md.getMonth()+1)+"/"+md.getDate()}</text>`;
    if(isSel&&d.net!==0)s+=`<text x="${cx}" y="${neg?y1+14:y1-6}" text-anchor="middle" font-size="11" fill="var(--ink)" font-family="var(--mono)">${money(d.net)}</text>`;
    s+=`<rect x="${L+colW*i}" y="0" width="${colW}" height="${H}" fill="transparent" data-w="${d.w}" style="cursor:pointer"><title>${d.w} 那一周：${money(d.net)}</title></rect>`;
  });
  const svg=$("chart");svg.innerHTML=s;
  svg.querySelectorAll("rect[data-w]").forEach(r=>{
    const pick=()=>{if(selWeek!==r.dataset.w){selWeek=r.dataset.w;renderChart(hMap())}};
    r.addEventListener("click",pick);r.addEventListener("mouseenter",pick);
  });
  const d=data.find(x=>x.w===selWeek), md=parseDay(d.w), end=parseDay(addDays(d.w,6));
  $("readout").innerHTML=`<b>${d.w===cur?"本周":""}${md.getMonth()+1}月${md.getDate()}日 – ${end.getMonth()+1}月${end.getDate()}日</b>：净省下 <b class="num">${money(d.net)}</b>`;
  $("split").innerHTML=`<span>当场省下 <b>${money(d.cash)}</b></span><span>估算少损失 <b>${money(d.fut)}</b></span>`;
  const ranked=Object.entries(d.per).filter(([,v])=>v>0).sort((a,b)=>b[1]-a[1]).slice(0,3);
  const worst=Object.entries(d.per).filter(([,v])=>v<0).sort((a,b)=>a[1]-b[1])[0];
  let html=ranked.length?`<div style="font-size:.85rem;color:var(--muted)">这一周贡献最大的习惯</div>`+ranked.map(([id,v],i)=>`<div class="top-row"><span class="num">${i+1}</span><span>${esc(map[id]?.name||"已删除的习惯")}</span><span class="num">${money(v)}</span></div>`).join(""):`<div style="font-size:.85rem;color:var(--muted)">这一周还没有记录。</div>`;
  if(worst)html+=`<div class="top-row" style="color:var(--bad)"><span>!</span><span>扣得最多：${esc(map[worst[0]]?.name||"已删除的习惯")}</span><span class="num">${money(worst[1])}</span></div>`;
  $("top").innerHTML=html;
}
let aesSig="", aesTm; const aesOpen=new Set();
function aesSetItems(items){settings={...settings,aes:{items}};renderRules();render();clearTimeout(aesTm);aesTm=setTimeout(saveSettings,800)}
function aesTotalText(){const y=aesYear(settings.aes);$("aesTotal").textContent="每年合计 "+money(y.all)}
function renderAes(){
  const items=aesItems(), sig=items.map(i=>i.id).join("|")+"|"+settings.cur+"|"+fx();
  const yr=it=>(+it.price||0)*(+it.n||0);
  if(sig!==aesSig||!$("aesList").children.length&&items.length){
    aesSig=sig;
    const ord=[...items].sort((a,b)=>yr(b)-yr(a)||(a.name?0:1)-(b.name?0:1));
    $("aesList").innerHTML=ord.length?ord.map(it=>`<details class="aes-row" data-id="${esc(it.id)}"${aesOpen.has(it.id)?" open":""}><summary><span class="aes-n"></span><span class="aes-y"></span><span class="aes-bar"><i></i></span><span class="aes-m"></span></summary>
      <div class="aes-body">
      <label class="full">项目名称<input type="text" maxlength="20" data-f="name" value="${esc(it.name||"")}" placeholder="例如 热玛吉 / 洗牙 / 私教课"></label>
      <label><span>每次价格（<span class="cur-label">${curName()}</span>）</span><input type="number" min="0" step="10" inputmode="decimal" data-f="price" value="${r2((+it.price||0)*fx())}"></label>
      <label>一年做几次<input type="number" min="0" step="1" inputmode="decimal" data-f="n" value="${+it.n||0}"></label>
      <div class="full"><div style="font-size:.85rem;margin-bottom:6px">跟哪些习惯有关</div><div class="chips">${Object.entries(LINKS).map(([k,L])=>`<button type="button" class="chip" data-link="${k}" aria-pressed="${it.links.includes(k)}">${L.label}</button>`).join("")}</div></div>
      <button type="button" class="btn aes-del" data-del aria-label="删除 ${esc(it.name||"项目")}">删除这个项目</button></div></details>`).join("")
      :`<p class="note" style="margin:0">还没有项目。点「+ 添加项目」加上你以后可能要花钱的项目。</p>`;
  }
  const max=Math.max(1,...items.map(yr));
  items.forEach(it=>{const row=$("aesList").querySelector(`.aes-row[data-id="${CSS.escape(it.id)}"]`);if(!row)return;
    row.querySelector(".aes-n").textContent=it.name||"未命名项目";
    row.querySelector(".aes-y").textContent=money(yr(it))+" / 年";
    row.querySelector(".aes-bar i").style.width=Math.round(yr(it)/max*100)+"%";
    const ln=it.links.map(k=>LINKS[k]&&LINKS[k].label).filter(Boolean);
    row.querySelector(".aes-m").textContent=`每次 ${money(+it.price||0)} × ${+it.n||0} 次`+(ln.length?" · 关联："+ln.join("、"):" · 还没关联习惯");});
  const tot=items.reduce((a,it)=>a+yr(it),0),linked=items.filter(it=>it.links.length).length;
  $("aesSumbar").innerHTML=`<div><b>${items.length}</b><span>个项目</span></div><div><b>${money(tot)}</b><span>每年合计</span></div><div><b>${money(tot/12)}</b><span>平均每月</span></div>`;
  $("aesSumbar").hidden=!items.length;
  aesTotalText();
}
$("aesList").addEventListener("toggle",e=>{const r=e.target.closest&&e.target.closest(".aes-row");if(!r)return;if(r.open)aesOpen.add(r.dataset.id);else aesOpen.delete(r.dataset.id)},true);
$("aesList").addEventListener("input",e=>{
  const f=e.target.dataset.f, row=e.target.closest(".aes-row"); if(!f||!row)return;
  const items=aesItems().map(x=>({...x,links:[...x.links]}));const it=items.find(x=>x.id===row.dataset.id);if(!it)return;
  if(f==="name")it.name=e.target.value.trim();
  else{const v=parseFloat(e.target.value);if(isNaN(v)||v<0)return;it[f]=f==="price"?v/fx():v}
  aesSetItems(items);
});

$("aesList").addEventListener("click",e=>{
  const ch=e.target.closest("[data-link]");
  if(ch){const row=ch.closest(".aes-row"),k=ch.dataset.link;const items=aesItems().map(x=>({...x,links:[...x.links]}));const it=items.find(x=>x.id===row.dataset.id);if(!it)return;
    it.links=it.links.includes(k)?it.links.filter(x=>x!==k):[...it.links,k];ch.setAttribute("aria-pressed",String(it.links.includes(k)));aesSetItems(items);return}
  if(e.target.dataset.del===undefined)return;e.preventDefault();const row=e.target.closest(".aes-row");
  const it=aesItems().find(x=>x.id===row.dataset.id);
  if(!e.target.dataset.armed){e.target.dataset.armed="1";const o=e.target.textContent;e.target.textContent="再点一次删除";setTimeout(()=>{if(e.target.isConnected){delete e.target.dataset.armed;e.target.textContent=o}},3500);return}
  aesSetItems(aesItems().filter(x=>x.id!==row.dataset.id));
});
$("aesAdd").addEventListener("click",()=>{
  const id="a"+Date.now().toString(36);
  aesOpen.add(id);aesSetItems([...aesItems().map(x=>({...x,links:[...x.links]})),{id,name:"",price:0,n:1,links:["sleep","train"]}]);
  const inp=document.querySelector(`.aes-row[data-id="${id}"] [data-f=name]`);if(inp)inp.focus();
});
function renderCur(){
  document.querySelectorAll(".cur-label").forEach(e=>e.textContent=curName());
  $("curAUD").setAttribute("aria-pressed",settings.cur!=="CNY");$("curCNY").setAttribute("aria-pressed",settings.cur==="CNY");

}
function setCur(c){if(settings.cur===c)return;settings={...settings,cur:c};renderRules();render();saveSettings()}
$("curAUD").onclick=()=>setCur("AUD");$("curCNY").onclick=()=>setCur("CNY");

function niceStep(x){const p=Math.pow(10,Math.floor(Math.log10(x||1)));const f=x/p;return (f<=1?1:f<=2?2:f<=5?5:10)*p}

// ---------- rules table ----------
function renderRules(){
  renderAes();renderCur();renderGrpSelect();
  const tb=$("rules");tb.innerHTML="";
  habits().forEach(h=>{
    const tr=document.createElement("tr");
    const custom=h.id.startsWith("c_");
    tr.innerHTML=`<td><div>${esc(h.name)}</div><span class="tag" style="background:var(--line)">${KIND_LABEL[h.kind]}</span></td><td>${h.kind==="count"?"—":h.ask?"每次填":h.link?`<span class="num">${money(h.val)}</span>`:`<input type="number" min="0" step="0.05" id="v-${h.id}" aria-label="${esc(h.name)} 每次金额">`}</td><td></td>`;
    const why=tr.children[2];
    if(custom){why.innerHTML=`<span style="color:var(--muted)">你自己添加的${h.ask?"，每次自己填金额":""}</span> `;const del=document.createElement("button");del.type="button";del.className="btn danger";del.textContent="删除";
      del.onclick=()=>{if(del.dataset.armed){removeCustom(h.id)}else{del.dataset.armed="1";del.textContent="确定删除？过去的记录不再计入";setTimeout(()=>{if(del.isConnected){delete del.dataset.armed;del.textContent="删除"}},4000)}};why.appendChild(del)}
    else why.textContent=h.why;
    const inp=tr.querySelector("input");
    if(inp){inp.value=r2(h.val*fx());let tm;inp.addEventListener("input",()=>{const v=parseFloat(inp.value);if(isNaN(v)||v<0)return;settings.vals={...settings.vals,[h.id]:v/fx()};render();clearTimeout(tm);tm=setTimeout(saveSettings,800)})}
    tb.appendChild(tr);
  });
}

// ---------- actions ----------
let tt;
function toast(msg){const t=$("toast");t.textContent=msg;t.hidden=false;clearTimeout(tt);tt=setTimeout(()=>t.hidden=true,3400)}
function log(h,d,amt){
  const t=today(),c={...(days[t]||{})},n=(c[h.id]||0)+d;if(n<0)return;
  c[h.id]=n;days={...days,[t]:c};
  if(h.ask){const a={...(amts[t]||{})},list=[...(a[h.id]||[])];if(d>0)list.push(amt);else list.pop();a[h.id]=list;amts={...amts,[t]:a}}
  render();persistDay(t);
  if(d>0&&h.kind.startsWith("bad"))try{window.__onLedgerBad&&window.__onLedgerBad(h,t)}catch(e){}
  if(d<=0)return;
  const map=hMap(),wk=sumDays(weekKeys(weekStart(t)),map),all=sumDays(Object.keys(days),map);
  if(h.kind==="count"){toast(`记下了。${streakText(h)||"继续保持"}`);return}
  if(h.ask){toast(`+${money(amt)}！本周净省下 ${money(wk.net)}`);return}
  if(h.kind.startsWith("bad")){toast(`记下了：扣 ${money(h.val)}。本周净省下 ${money(wk.net)}`);return}
  const nm=milestones().find(m=>m.amt>all.net);
  toast(`+${money(h.val)}！本周净省下 ${money(wk.net)}`+(nm?`，离「${nm.name}」还差 ${money(nm.amt-all.net)}`:""));
}
let askH=null;
function openAsk(h){askH=h;$("askTitle").textContent=h.name;$("askLabel").textContent=h.askLabel||"这次多少钱？";$("askVal").value="";$("askMsg").textContent="";$("ask").hidden=false;setTimeout(()=>$("askVal").focus(),30)}
function closeAsk(){$("ask").hidden=true;askH=null}
$("askCancel").onclick=closeAsk;
$("ask").addEventListener("click",e=>{if(e.target.id==="ask")closeAsk()});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!$("ask").hidden)closeAsk()});
$("askForm").addEventListener("submit",e=>{e.preventDefault();const v=parseFloat($("askVal").value);
  if(isNaN(v)||v<=0){$("askMsg").textContent="请填一个大于 0 的金额。";return}
  const h=askH;closeAsk();log(h,1,v*(h.mult||1)/fx())});
$("saveBtn").onclick=()=>{
  const ws=weekStart(today()),tr={...settings.transfers};
  if(tr[ws]!=null){delete tr[ws];settings={...settings,transfers:tr};render();saveSettings();toast("已撤销本周的转入记录");return}
  const wk=sumDays(weekKeys(ws),hMap());if(wk.cash<=0)return;
  tr[ws]=Math.round(wk.cash*100)/100;settings={...settings,transfers:tr};render();saveSettings();
  toast(`记下了：本周转入储蓄 ${money(tr[ws])}`);
};
$("addForm").addEventListener("submit",e=>{
  e.preventDefault();
  const name=$("newName").value.trim(),kind=$("newKind").value,val=parseFloat($("newVal").value);
  if(!name){$("formMsg").textContent="请填写习惯名称。";return}
  const ask=$("newAsk").checked&&kind!=="count";
  if(kind!=="count"&&!ask&&(isNaN(val)||val<0)){$("formMsg").textContent="每次金额要填 0 或以上的数字。";return}
  if(habits().some(h=>h.name===name)){$("formMsg").textContent="已经有同名的习惯了。";return}
  const grp=$("newGrp").value;const h={id:"c_"+Date.now().toString(36),kind,name,...(grp?{grp}:{}),val:kind==="count"||ask?0:val/fx(),...(ask?{ask:true}:{})};
  $("newAsk").checked=false;$("newVal").disabled=false;
  settings={...settings,custom:[...settings.custom,h]};
  $("formMsg").textContent="";$("newName").value="";
  renderRules();render();saveSettings();toast(`已添加「${name}」`);
});
const syncNew=()=>{$("newVal").disabled=$("newKind").value==="count"||$("newAsk").checked};$("newKind").addEventListener("change",syncNew);$("newAsk").addEventListener("change",syncNew);
const COLLAPSE_KEY="ledger-collapsed";
function getCollapsed(){try{const v=JSON.parse(localStorage.getItem(COLLAPSE_KEY)||"null");if(Array.isArray(v))return v}catch(e){}return collapsedMem??allGroups().map(g=>g.id).filter(id=>id!=="cash")}
let collapsedMem=null;
function setCollapsed(a){collapsedMem=a;try{localStorage.setItem(COLLAPSE_KEY,JSON.stringify(a))}catch(e){}}
function isCollapsed(id){return getCollapsed().includes(id)}
function allGroups(){return [...GROUPS,...(settings.groups||[])]}
function groupOf(h){const g=h.grp||(h.kind.startsWith("bad")?"bad":h.kind);return allGroups().some(x=>x.id===g)?g:(h.kind.startsWith("bad")?"bad":h.kind)}
function hideGroup(g){settings={...settings,hiddenGroups:[...new Set([...(settings.hiddenGroups||[]),g.id])]};renderGrpSelect();render();saveSettings();toast(`已删除板块「${g.title}」，可以在下方恢复`)}
function restoreGroup(g){settings={...settings,hiddenGroups:(settings.hiddenGroups||[]).filter(x=>x!==g.id)};renderGrpSelect();render();saveSettings();toast(`已恢复板块「${g.title}」`)}
function renderGrpSelect(){const sel=$("newGrp");if(!sel)return;const cur=sel.value;const hidG=new Set(settings.hiddenGroups||[]);
  sel.innerHTML=`<option value="">按类型自动放</option>`+allGroups().filter(g=>!hidG.has(g.id)).map(g=>`<option value="${g.id}">${esc(g.title)}</option>`).join("");
  if([...sel.options].some(o=>o.value===cur))sel.value=cur}
function hideHabit(h){settings={...settings,hidden:[...new Set([...(settings.hidden||[]),h.id])]};render();saveSettings();toast(`已删除「${h.name}」，可以在下方恢复`)}
function restoreHabit(h){settings={...settings,hidden:(settings.hidden||[]).filter(x=>x!==h.id)};render();saveSettings();toast(`已恢复「${h.name}」`)}
function removeCustom(id){
  settings={...settings,custom:settings.custom.filter(h=>h.id!==id),hidden:(settings.hidden||[]).filter(x=>x!==id)};
  const v={...settings.vals};delete v[id];settings.vals=v;
  renderRules();render();saveSettings();toast("已删除");
}

// ---------- storage ----------
function lsGet(){try{const s=JSON.parse(localStorage.getItem("habit-ledger")||"null");if(s){days=s.days||{};amts=s.amts||{};notes=s.notes||[];if(s.settings)settings={...settings,hidden:[],groups:[],hiddenGroups:[],cur:"AUD",rate:4.68,...s.settings,aes:{...AES_DEFAULT,...(s.settings.aes||{})}};else if(s.vals)settings.vals=s.vals}}catch(e){}}
function lsSave(){try{localStorage.setItem("habit-ledger",JSON.stringify({days,amts,settings,notes}))}catch(e){}}
function queueWrite(key,fn){
  const q=pending[key]||(pending[key]={busy:false,again:false,timer:null});
  clearTimeout(q.timer);
  q.timer=setTimeout(async function run(){
    q.timer=null;
    if(q.busy){q.again=true;return}
    q.busy=true;
    try{await fn()}catch(e){if(e&&(e.code==="invalid_argument"||e.code==="not_granted"||e.code==="revoked")){goLocal();return}setStatus(e&&e.code==="quota_exceeded"?"存储空间满了，保存失败。":"这次没保存上，稍后再点一下试试。")}
    q.busy=false;
    if(q.again){q.again=false;run()}
  },500);
}
const dirty=k=>pending[k]&&(pending[k].busy||pending[k].timer);
function persistDay(t){if(mode!=="db"){lsSave();return}queueWrite(t,()=>db.collection("data/users/"+uid).doc(t).set({date:t,counts:days[t]||{},amts:amts[t]||{}}))}
function saveSettings(){if(mode!=="db"){lsSave();return}queueWrite("settings",()=>db.collection("data/users/"+uid).doc("settings").set({kind:"settings",vals:settings.vals,custom:settings.custom,transfers:settings.transfers,aes:settings.aes,hidden:settings.hidden||[],groups:settings.groups||[],hiddenGroups:settings.hiddenGroups||[],cur:settings.cur||"AUD",rate:settings.rate||4.68}))}
function setStatus(s){$("status").textContent=s}

// ---------- notes ----------
let editing=null;
const notesCol=()=>db.collection("data/users/"+uid).doc("notes").collection("items");
let notesAll=false,archOpen=false;
function noteEl(n,arch){
  const d=new Date(n.at),el=document.createElement("div");el.className="note-item"+(arch?" arch":"");
  el.innerHTML=`<div class="note-meta"><span>${d.getMonth()+1}月${d.getDate()}日 ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}</span><span class="note-act"></span></div><div class="note-text"></div>`;
  el.querySelector(".note-text").textContent=n.text;
  const act=el.querySelector(".note-act"),b=(t,f)=>{const x=document.createElement("button");x.type="button";x.className="undo";x.textContent=t;x.onclick=f;return x};
  if(arch)act.append(b("取出",()=>setNoteArch(n,false)));
  else act.append(b("编辑",()=>{editing=n.id;$("noteText").value=n.text;$("noteSave").textContent="保存修改";$("noteCancel").hidden=false;$("noteText").focus()}),b("收纳",()=>setNoteArch(n,true)));
  const del=b("删除",()=>{if(del.dataset.armed){removeNote(n.id)}else{del.dataset.armed="1";del.textContent="确定删除？";setTimeout(()=>{if(del.isConnected){delete del.dataset.armed;del.textContent="删除"}},4000)}});del.style.color="var(--bad)";
  act.append(del);return el;
}
function renderNotes(){
  const box=$("noteList");box.innerHTML="";
  const act=[...notes].filter(n=>!n.arch).sort((a,b)=>b.at-a.at),arc=[...notes].filter(n=>n.arch).sort((a,b)=>(b.archAt||b.at)-(a.archAt||a.at));
  if(!notes.length){box.innerHTML=`<p class="note" style="margin:0">还没有便签。可以记下今天的感受、想买但忍住的东西、下次想加的习惯。</p>`;return}
  if(!act.length)box.insertAdjacentHTML("beforeend",`<p class="note" style="margin:0">桌面上没有便签了，旧的都在收纳盒里。</p>`);
  (notesAll?act:act.slice(0,3)).forEach(n=>box.appendChild(noteEl(n,false)));
  if(act.length>3){const m=document.createElement("button");m.type="button";m.className="btn";m.textContent=notesAll?"只看最近 3 条":`显示全部 ${act.length} 条`;m.onclick=()=>{notesAll=!notesAll;renderNotes()};box.appendChild(m)}
  if(arc.length){const d=document.createElement("details");d.className="note-box";d.open=archOpen;d.ontoggle=()=>{archOpen=d.open};
    d.innerHTML=`<summary>收纳盒（${arc.length} 条）</summary><div class="note-boxl"></div>`;
    arc.forEach(n=>d.querySelector(".note-boxl").appendChild(noteEl(n,true)));box.appendChild(d)}
  const sum=$("notesSum");if(sum)sum.textContent=act.length?act.length+" 条"+(arc.length?" · 收纳 "+arc.length:""):(arc.length?"收纳 "+arc.length+" 条":"");
}
async function setNoteArch(n,v){
  const nn={...n,arch:v,archAt:v?Date.now():null};notes=[...notes.filter(x=>x.id!==n.id),nn];if(editing===n.id)resetComposer();renderNotes();
  if(mode==="db"){try{await notesCol().doc(n.id).set(nn)}catch(err){setStatus("便签没保存上，稍后再试。")}}else lsSave();
  toast(v?"已放进收纳盒":"已从收纳盒取出");
}
function resetComposer(){editing=null;$("noteText").value="";$("noteSave").textContent="保存便签";$("noteCancel").hidden=true}
$("noteCancel").onclick=resetComposer;
$("noteForm").addEventListener("submit",async e=>{
  e.preventDefault();const text=$("noteText").value.trim();if(!text)return;
  const id=editing||("n"+Date.now().toString(36));
  const old=notes.find(x=>x.id===id);const n={id,text,at:old?old.at:Date.now(),arch:false};
  notes=[...notes.filter(x=>x.id!==id),n];resetComposer();renderNotes();
  if(mode==="db"){try{await notesCol().doc(id).set(n)}catch(err){if(err&&err.code==="invalid_argument")goLocal();else setStatus("便签没保存上，稍后再试。")}}else lsSave();
  toast(old?"便签已更新":"便签已保存");
});
async function removeNote(id){
  notes=notes.filter(x=>x.id!==id);if(editing===id)resetComposer();renderNotes();
  if(mode==="db"){try{await notesCol().doc(id).delete()}catch(err){setStatus("删除没成功，稍后再试。")}}else lsSave();
}

async function boot(){
  renderRules();render();
  const cl=window.claude;
  if(!cl||!cl.use){fallback();return}
  try{
    const [d,u]=await Promise.all([cl.use("db"),cl.use("user")]);
    uid=u?await u.id():null;
    if(!d||!uid){fallback();return}
    let lo=null;try{lo=localStorage.getItem("ledger-local-only")}catch(e){}
    if(lo){fallback();setStatus(LOCAL_MSG);return}
    db=d;mode="db";
  }catch(e){fallback();return}
  const timer=setTimeout(()=>setStatus("暂时连不上云端记录，显示的可能不是最新的。"),10000);
  db.collection("data/users/"+uid).onSnapshot(snap=>{
    const nd={},na={};let ns=null;
    snap.docs.forEach(doc=>{const v0=doc.data();if(!v0)return;const v=JSON.parse(JSON.stringify(v0));
      if(v.amts)na[doc.id]=v.amts;
      if(doc.id==="settings")ns={vals:v.vals||{},custom:v.custom||[],transfers:v.transfers||{},hidden:v.hidden||[],groups:v.groups||[],hiddenGroups:v.hiddenGroups||[],cur:v.cur||"AUD",rate:v.rate||4.68,aes:{...AES_DEFAULT,...(v.aes||{})}};
      else if(v.counts)nd[doc.id]=v.counts});
    for(const k of Object.keys(pending))if(/^\d{4}-/.test(k)&&dirty(k)&&days[k]){nd[k]=days[k];na[k]=amts[k]}
    days=nd;amts=na;
    if(ns&&!dirty("settings")){settings=ns;renderRules()}
    if(!snap.metadata.fromCache){clearTimeout(timer);setStatus(snap.empty?"还没有记录。做完一件事，点下面对应的卡片。":"记录已同步，换设备打开也能看到。")}
    render();
  },()=>{clearTimeout(timer);setStatus("读取记录失败了，刷新页面再试。")});
  notesCol().onSnapshot(snap=>{notes=snap.docs.map(d=>d.data()).filter(Boolean).map(x=>JSON.parse(JSON.stringify(x)));renderNotes()},()=>{});
}
const LOCAL_MSG="你的账号不能把记录存到云端，已改为保存在这个浏览器里。换设备或清除浏览器数据会丢失。";
function goLocal(){if(mode==="local")return;mode="local";try{localStorage.setItem("ledger-local-only","1")}catch(e){}lsSave();setStatus(LOCAL_MSG)}
function fallback(){mode="local";lsGet();renderRules();render();renderNotes();setStatus("记录只保存在这个浏览器里。")}
// ---------- tabs + link to 减脂打卡 ----------
function showTab(name){const V=["today","ledger","cut","plan","cycle","set"];if(!V.includes(name))name="ledger";
  const cut=name==="cut",plan=name==="plan",cyc=name==="cycle",tdy=name==="today",set=name==="set";
  $("cut").hidden=!cut;$("ledgerView").hidden=name!=="ledger";$("plan").hidden=!plan;$("cycle").hidden=!cyc;$("todayView").hidden=!tdy;$("setView").hidden=!set;
  $("tabCut").setAttribute("aria-selected",cut);$("tabPlan").setAttribute("aria-selected",plan);$("tabCycle").setAttribute("aria-selected",cyc);$("tabLedger").setAttribute("aria-selected",name==="ledger");
  $("tabToday").setAttribute("aria-selected",tdy);$("tabSet").setAttribute("aria-selected",set);
  {const ov=document.querySelector(".ov");if(ov)ov.hidden=tdy||set}
  document.querySelector(".wrap").classList.toggle("wide",plan);
  if(plan&&window.__planShown)window.__planShown();
  if(cyc&&window.__cycleShown)window.__cycleShown();
  if(tdy&&window.__todayShown)window.__todayShown();
  if(set&&window.__setShown)window.__setShown();
  try{localStorage.setItem("ledger-tab",name);localStorage.setItem("ledger-tab-day",today())}catch(e){}}
$("tabLedger").onclick=()=>showTab("ledger");$("tabCut").onclick=()=>showTab("cut");$("tabPlan").onclick=()=>showTab("plan");$("tabCycle").onclick=()=>showTab("cycle");$("tabToday").onclick=()=>showTab("today");$("tabSet").onclick=()=>showTab("set");
{let t0="today";try{const a=localStorage.getItem("ledger-tab"),d=localStorage.getItem("ledger-tab-day");if(a&&d===today())t0=a}catch(e){}showTab(t0)}
window.__cutRendered=()=>{if(typeof render==="function"&&mode!=="loading")render()};
window.__cutHook=(pro,target)=>{
  if(mode==="loading")return;
  const t=today(),h=hMap().protein;
  if(h&&pro>=target&&!((days[t]||{}).protein)){log(h,1);toast(`蛋白质 ${pro} g 达标，已在省钱账本自动打卡 ✓`)}
};
// ---------- bridge for 日常计划 / 今天概览 ----------
window.__toastAny=m=>toast(m);
function logAt(k,h,d){const c={...(days[k]||{})},n=(c[h.id]||0)+d;if(n<0)return false;c[h.id]=n;days={...days,[k]:c};
  render();persistDay(k);
  if(d>0&&h.kind.startsWith("bad"))try{window.__onLedgerBad&&window.__onLedgerBad(h,k)}catch(e){}
  return true}
window.__ledger={
  ready:()=>mode!=="loading",
  mode:()=>mode,
  range:(a,b)=>{const map=hMap(),sm=sumDays(Object.keys(days).filter(k=>k>=a&&k<=b),map);return {cash:sm.cash,fut:sm.fut,net:sm.net}},
  usage:n=>{const t=today(),o={};for(let i=0;i<n;i++){const c=days[addDays(t,-i)];if(c)for(const id in c)if(c[id]>0)o[id]=(o[id]||0)+c[id]}return o},
  firstDay:()=>firstDay(),
  hideMany:ids=>{settings={...settings,hidden:[...new Set([...(settings.hidden||[]),...ids])]};render();saveSettings()},
  habits:()=>{const t=today(),c=days[t]||{},hid=new Set(settings.hidden||[]),hg=new Set(settings.hiddenGroups||[]);
    return habits().filter(h=>!hid.has(h.id)&&!hg.has(groupOf(h))).map(h=>({id:h.id,name:h.name,kind:h.kind,ask:!!h.ask,weekly:!!h.weekly,val:h.val,n:c[h.id]||0}))},
  freq:n=>{const t=today(),o={};for(let i=1;i<=n;i++){const c=days[addDays(t,-i)];if(c)for(const id in c)if(c[id]>0)o[id]=(o[id]||0)+1}return o},
  tap:id=>{const h=hMap()[id];if(!h)return;if(h.ask)openAsk(h);else log(h,1)},
  undo:id=>{const h=hMap()[id];if(h)log(h,-1)},
  weekDetail:ws=>{const map=hMap(),keys=weekKeys(ws),sm=sumDays(keys,map),cnt={};keys.forEach(k=>Object.entries(days[k]||{}).forEach(([id,n])=>{if(n)cnt[id]=(cnt[id]||0)+n}));
    return {cash:sm.cash,fut:sm.fut,net:sm.net,rows:Object.keys(cnt).filter(id=>map[id]).map(id=>({id,name:map[id].name,n:cnt[id],amt:sm.per[id]||0,bad:map[id].kind.startsWith("bad")}))}},
  weekStart:k=>weekStart(k||today()),addDays:(k,n)=>addDays(k,n),
  log:(k,id,d)=>{const h=hMap()[id];return h&&!h.ask?logAt(k,h,d):false},
  val:id=>(hMap()[id]||{}).val||0,
  money:n=>money(n),
  day:k=>sumDays([k],hMap()),
  dayDetail:k=>{const map=hMap(),c=days[k]||{},sm=sumDays([k],map);return Object.keys(c).filter(id=>c[id]>0&&map[id]).map(id=>({name:map[id].name,n:c[id],amt:sm.per[id]||0,bad:map[id].kind.startsWith("bad")}))},
  week:k=>{const map=hMap(),ws=weekStart(k||today()),wk=sumDays(weekKeys(ws),map),all=sumDays(Object.keys(days),map),tr=settings.transfers||{};
    return {ws,cash:wk.cash,net:wk.net,allNet:all.net,transferred:tr[ws]??null,totalT:Object.values(tr).reduce((a,b)=>a+b,0)}},
  transfers:()=>({...(settings.transfers||{})}),
  addTransfer:(amt,k)=>{const ws=weekStart(k||today()),tr={...settings.transfers};tr[ws]=r2((tr[ws]||0)+amt);if(tr[ws]<=0)delete tr[ws];
    settings={...settings,transfers:tr};render();saveSettings();return ws},
  month:(y,m)=>{const pre=y+"-"+String(m+1).padStart(2,"0"),keys=Object.keys(days).filter(k=>k.startsWith(pre)),map=hMap(),sm=sumDays(keys,map),cnt={};
    keys.forEach(k=>Object.entries(days[k]||{}).forEach(([id,n])=>{if(n)cnt[id]=(cnt[id]||0)+n}));
    const rows=Object.keys(cnt).filter(id=>map[id]).map(id=>({id,name:map[id].name,n:cnt[id],amt:sm.per[id]||0,bad:map[id].kind.startsWith("bad")}));
    const tr=Object.entries(settings.transfers||{}).filter(([w])=>w.startsWith(pre)).reduce((a,[,v])=>a+v,0);
    return {cash:sm.cash,fut:sm.fut,net:sm.net,transferred:tr,bad:rows.filter(r=>r.bad).sort((a,b)=>a.amt-b.amt),good:rows.filter(r=>!r.bad).sort((a,b)=>b.n-a.n)}}
};
window.__bk=window.__bk||{};
window.__bk.ledger={
  dump:()=>JSON.parse(JSON.stringify({days,amts,settings,notes})),
  merge:d=>{if(!d||mode==="loading")return 0;let n=0;const empty=!Object.keys(days).length,nd={...days},na={...amts},touched=[];
    Object.keys(d.days||{}).forEach(k=>{if(!/^\d{4}-\d\d-\d\d$/.test(k))return;const a={...(nd[k]||{})},b=d.days[k]||{},aa={...(na[k]||{})},ba=(d.amts||{})[k]||{};let ch=false;
      Object.keys(b).forEach(id=>{const v=+b[id]||0;if(v>(a[id]||0)){a[id]=v;if(Array.isArray(ba[id]))aa[id]=ba[id].slice();ch=true}});
      if(ch){nd[k]=a;if(Object.keys(aa).length)na[k]=aa;touched.push(k);n++}});
    days=nd;amts=na;
    const s=d.settings||{},cur=settings,byId=(a,b)=>{const m=new Map();[...(b||[]),...(a||[])].forEach(x=>{if(x&&x.id)m.set(x.id,x)});return [...m.values()]};
    const tr={...(s.transfers||{})};Object.entries(cur.transfers||{}).forEach(([w,v])=>{tr[w]=Math.max(+v||0,+tr[w]||0)});
    settings={...cur,vals:{...(s.vals||{}),...cur.vals},custom:byId(cur.custom,s.custom),groups:byId(cur.groups,s.groups),transfers:tr,
      ...(empty?{aes:{...AES_DEFAULT,...(s.aes||{})},hidden:s.hidden||[],hiddenGroups:s.hiddenGroups||[],cur:s.cur||cur.cur,rate:s.rate||cur.rate}:{})};
    const have=new Set(notes.map(x=>x.id)),add=(d.notes||[]).filter(x=>x&&x.id&&!have.has(x.id));
    notes=[...notes,...add];
    touched.forEach(persistDay);saveSettings();
    if(mode==="db")add.forEach(x=>notesCol().doc(x.id).set(x).catch(()=>{}));else lsSave();
    renderRules();renderGrpSelect();render();renderNotes();return n+add.length}
};
{const r0=render;render=function(){r0.apply(this,arguments);try{window.__overview&&window.__overview()}catch(e){}try{window.__savingsRender&&window.__savingsRender()}catch(e){}}}
{const tt=$("toTop"),rm=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;
  const upd=()=>{tt.hidden=window.scrollY<400};
  window.addEventListener("scroll",upd,{passive:true});upd();
  tt.onclick=()=>{window.scrollTo({top:0,behavior:rm?"auto":"smooth"});const h=document.querySelector("h1");if(h){h.setAttribute("tabindex","-1");h.focus({preventScroll:true})}}}
renderNotes();boot();