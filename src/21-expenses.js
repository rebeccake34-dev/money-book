(function(){
  const box=document.getElementById("expSec");if(!box)return;
  const CATS=[["餐饮",20],["买菜",95],["交通",210],["购物",320],["娱乐",265],["美容护肤",340],["医疗",0],["社交礼物",45],["学习",235],["日用",160],["其他",30]];
  const hueOf=c=>{const f=CATS.find(x=>x[0]===c);return f?f[1]:200};
  const LKEY="expenses-v1";
  let months={},budget=0,wk={},wkOpen=false,col=null,setRef=null,draft={amt:"",note:"",cat:"餐饮",date:""},showAll=false;
  try{const c=JSON.parse(localStorage.getItem(LKEY)||"null");if(c){months=c.months||{};budget=c.budget||0;wk=c.wk||{}}}catch(e){}
  const pad=n=>String(n).padStart(2,"0");
  const ymd=d=>d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate());
  const parse=k=>{const p=k.split("-");return new Date(+p[0],+p[1]-1,+p[2])};
  const WD=["周日","周一","周二","周三","周四","周五","周六"];
  const money=n=>"$"+(+n||0).toLocaleString("en-AU",{minimumFractionDigits:2,maximumFractionDigits:2});
  const el=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
  const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);
  const toast=m=>{try{const t=document.getElementById("toast");t.textContent=m;t.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(()=>t.hidden=true,3000)}catch(e){}};
  function all(){return Object.values(months).reduce((a,l)=>a.concat(l||[]),[])}
  function cache(){try{localStorage.setItem(LKEY,JSON.stringify({months,budget,wk}))}catch(e){}}
  const chains={};
  function saveMonth(mk){cache();if(!col)return;const body={list:months[mk]||[]};
    chains[mk]=(chains[mk]||Promise.resolve()).then(()=>col.doc(mk).set(body)).catch(()=>toast("开支没保存上，稍后再试"))}
  function saveBudget(){cache();if(setRef)setRef.set({budget,wk:JSON.parse(JSON.stringify(wk))}).catch(()=>{})}
  function add(e){const mk=e.date.slice(0,7);(months[mk]=months[mk]||[]).push(e);saveMonth(mk);render();notify();return e.id}
  function remove(id){for(const mk of Object.keys(months)){const b=months[mk].length;months[mk]=months[mk].filter(x=>x.id!==id);if(months[mk].length!==b){saveMonth(mk);break}}render();notify()}
  function notify(){try{window.__savingsRender&&window.__savingsRender()}catch(e){}try{window.__overview&&window.__overview()}catch(e){}}
  function sumBetween(a,b){return all().filter(x=>x.date>=a&&x.date<=b).reduce((s,x)=>s+x.amt,0)}
  function weekOf(wsk){const now=new Date();if(!wsk){const w=new Date(now);w.setDate(now.getDate()-((now.getDay()+6)%7));wsk=ymd(w)}
    const e=parse(wsk);e.setDate(e.getDate()+6);const ek=ymd(e),by={};let total=0;
    all().forEach(x=>{if(x.date>=wsk&&x.date<=ek){by[x.cat]=(by[x.cat]||0)+x.amt;total+=x.amt}});
    let tb=0,used=0;const over=[];Object.keys(wk).forEach(c=>{const b=+wk[c]||0;if(!b)return;tb+=b;used+=by[c]||0;if((by[c]||0)>b)over.push([c,(by[c]||0)-b])});
    return {ws:wsk,total,byCat:by,totalBudget:tb,used,left:tb-used,over,top:Object.entries(by).sort((a,b)=>b[1]-a[1])[0]||null}}
  window.__bk=window.__bk||{};
  window.__bk.exp={dump:()=>JSON.parse(JSON.stringify({months,budget,wk})),
    merge:d=>{if(!d)return 0;let n=0;const ids=new Set(all().map(x=>x.id)),touched=new Set();
      Object.keys(d.months||{}).forEach(mk=>{if(!/^\d{4}-\d\d$/.test(mk))return;(d.months[mk]||[]).forEach(x=>{if(!x||!x.id||ids.has(x.id))return;(months[mk]=months[mk]||[]).push(x);ids.add(x.id);touched.add(mk);n++})});
      touched.forEach(saveMonth);let cfg=false;if(!budget&&+d.budget>0){budget=+d.budget;cfg=true}
      Object.keys(d.wk||{}).forEach(c=>{if(wk[c]==null&&+d.wk[c]>0){wk[c]=+d.wk[c];cfg=true}});
      if(cfg)saveBudget();const a=document.activeElement;if(a&&box.contains(a)&&a.blur)a.blur();render();notify();return n}};
  window.__expenses={
    cats:()=>CATS.map(c=>c[0]),hue:c=>hueOf(c),week:wsk=>weekOf(wsk),budget:()=>budget,money:money,
    add:(amt,cat,note,date,src)=>add({id:uid(),date:date||ymd(new Date()),amt:Math.round(amt*100)/100,cat:cat||"其他",note:note||"",src:src||""}),
    remove:remove,
    day:k=>sumBetween(k,k),range:(a,b)=>sumBetween(a,b),
    weeklyAvg:()=>{const now=new Date(),list=all();if(!list.length)return null;const first=list.map(x=>x.date).sort()[0];
      const a=new Date(now);a.setDate(now.getDate()-27);let ak=ymd(a);if(first>ak)ak=first;const w=Math.max(1,(now-parse(ak))/6048e5+1/7);
      return {avg:sumBetween(ak,ymd(now))/w,weeks:w}},
    month:(y,m)=>{const mk=y+"-"+pad(m+1),l=months[mk]||[],by={};l.forEach(x=>by[x.cat]=(by[x.cat]||0)+x.amt);
      return {total:l.reduce((s,x)=>s+x.amt,0),count:l.length,byCat:Object.entries(by).sort((a,b)=>b[1]-a[1]),budget}}
  };
  function render(){
    const a=document.activeElement;if(a&&box.contains(a)&&(a.tagName==="INPUT"))return;
    box.textContent="";
    const now=new Date(),tk=ymd(now),mk=tk.slice(0,7);
    const ws=new Date(now);ws.setDate(now.getDate()-((now.getDay()+6)%7));const wsk=ymd(ws);
    const lm=new Date(now.getFullYear(),now.getMonth()-1,1),lmk=ymd(lm).slice(0,7);
    const mList=months[mk]||[],mTot=mList.reduce((s,x)=>s+x.amt,0),lmTot=(months[lmk]||[]).reduce((s,x)=>s+x.amt,0);
    const lmSame=(months[lmk]||[]).filter(x=>+x.date.slice(8)<=now.getDate()).reduce((s,x)=>s+x.amt,0);
    const h=el("div","exp-head");h.appendChild(el("h2",null,"日常开支"));h.appendChild(el("span","note","记录不固定的花销，房租等固定开支在储蓄板块里设置"));box.appendChild(h);
    const sm=el("div","exp-sum");
    [["今天",money(sumBetween(tk,tk)),(all().filter(x=>x.date===tk).length)+" 笔"],["本周",money(sumBetween(wsk,tk)),"从周一算起"],
     ["本月",money(mTot),lmTot?"上月同期 "+money(lmSame)+(mTot>lmSame?" · 多花 "+money(mTot-lmSame):" · 少花 "+money(lmSame-mTot)):"上月没有记录"]]
     .forEach(([x,y,z])=>{const d=el("div","exp-s");d.appendChild(el("small",null,x));d.appendChild(el("b",null,y));d.appendChild(el("span",null,z));sm.appendChild(d)});
    box.appendChild(sm);
    // budget
    const bd=el("div","exp-budget");
    if(budget>0){const p=mTot/budget,days=new Date(now.getFullYear(),now.getMonth()+1,0).getDate(),left=days-now.getDate()+1;
      const bb=el("div","exp-bbar"+(p>1?" over":p>.8?" warn":""));const i=el("i");i.style.width=Math.min(100,p*100)+"%";bb.appendChild(i);
      bd.appendChild(el("span",null,"本月预算 "+money(budget)+" · 已用 "+Math.round(p*100)+"%"+(p<=1?" · 还剩 "+money(budget-mTot)+"，接下来 "+left+" 天每天约 "+money((budget-mTot)/left):" · 已超出 "+money(mTot-budget))));
      bd.appendChild(bb)}
    const br=el("div","exp-row1");const bi=el("input");bi.type="number";bi.min="0";bi.id="expBudget";bi.placeholder="每月预算";bi.value=budget||"";bi.style.flex="0 1 130px";bi.setAttribute("aria-label","每月开支预算");
    const bbtn=el("button","btn",budget?"改预算":"设每月预算");bbtn.type="button";bbtn.onclick=()=>{const v=parseFloat(bi.value);budget=isNaN(v)||v<0?0:v;saveBudget();render();toast(budget?"每月预算设为 "+money(budget):"已取消预算")};
    br.appendChild(bi);br.appendChild(bbtn);bd.appendChild(br);box.appendChild(bd);
    // weekly budgets by category
    {const W=weekOf(),wb=el("div","exp-wk"),cats=CATS.map(c=>c[0]).filter(c=>+wk[c]>0);
      if(cats.length){wb.appendChild(el("p","pay-sec","本周预算 "+money(W.totalBudget)+" · "+(W.left>=0?"还能花 "+money(W.left):"已超出 "+money(-W.left))));
        cats.forEach(c=>{const b=+wk[c],u=W.byCat[c]||0,p=u/b,r=el("div","exp-wkrow");
          const t=el("span","exp-wkn",c);t.style.setProperty("--h",hueOf(c));r.appendChild(t);
          const bb=el("div","exp-bbar"+(p>1?" over":p>.8?" warn":""));const i=el("i");i.style.width=Math.min(100,p*100)+"%";bb.appendChild(i);r.appendChild(bb);
          r.appendChild(el("span","exp-wkv"+(p>1?" over":""),p>1?"超 "+money(u-b):"剩 "+money(b-u)));wb.appendChild(r)})}
      const dt=el("details","exp-wkset");if(wkOpen)dt.open=true;dt.ontoggle=()=>wkOpen=dt.open;
      dt.appendChild(el("summary",null,cats.length?"修改每类的每周预算":"给每类开支设每周预算"));
      const g=el("div","exp-wkgrid"),ins={};
      CATS.forEach(([c],ix)=>{const l=el("label",null,c),i=el("input");i.type="number";i.min="0";i.step="1";i.inputMode="decimal";i.placeholder="不限";i.value=wk[c]||"";i.id="expWk"+ix;ins[c]=i;l.appendChild(i);g.appendChild(l)});
      dt.appendChild(g);
      const row=el("div","exp-row1");
      const sv=el("button","btn primary","保存每周预算");sv.type="button";
      sv.onclick=()=>{const n={};Object.keys(ins).forEach(c=>{const v=parseFloat(ins[c].value);if(v>0)n[c]=Math.round(v*100)/100});wk=n;saveBudget();
        const f=document.activeElement;if(f&&f.blur)f.blur();render();notify();toast(Object.keys(n).length?"每周预算已保存":"已取消每周预算")};
      const au=el("button","btn","按最近 4 周平均填入");au.type="button";
      au.onclick=()=>{const now2=new Date(),a2=new Date(now2);a2.setDate(now2.getDate()-27);const ak=ymd(a2),tk2=ymd(now2),by={};all().forEach(x=>{if(x.date>=ak&&x.date<=tk2)by[x.cat]=(by[x.cat]||0)+x.amt});
        let any=false;Object.keys(ins).forEach(c=>{if(by[c]){ins[c].value=Math.ceil(by[c]/4/5)*5;any=true}});toast(any?"已按平均值填好，可以改小一点再点保存":"最近 4 周还没有开支记录")};
      row.appendChild(sv);row.appendChild(au);dt.appendChild(row);
      dt.appendChild(el("p","note","留空表示这一类不限。每周从周一算起；超了会在「今天」页和每周小结里提醒。"));
      wb.appendChild(dt);box.appendChild(wb)}
    // form
    const f=el("form","exp-form");f.noValidate=true;
    const cats=el("div","exp-cats");
    CATS.forEach(([c,hh])=>{const b=el("button","exp-cat",c);b.type="button";b.style.setProperty("--h",hh);b.setAttribute("aria-pressed",String(draft.cat===c));
      b.onclick=()=>{draft.cat=c;cats.querySelectorAll(".exp-cat").forEach(x=>x.setAttribute("aria-pressed",String(x===b)))};cats.appendChild(b)});
    f.appendChild(cats);
    const r1=el("div","exp-row1");
    const ai=el("input");ai.type="number";ai.id="expAmt";ai.min="0";ai.step="0.01";ai.inputMode="decimal";ai.placeholder="金额";ai.value=draft.amt;ai.oninput=()=>draft.amt=ai.value;
    const ni=el("input");ni.type="text";ni.id="expNote";ni.placeholder="买了什么（可不填）";ni.maxLength=80;ni.value=draft.note;ni.oninput=()=>draft.note=ni.value;
    const di=el("input");di.type="date";di.id="expDate";di.value=draft.date||tk;di.max=tk;di.onchange=()=>draft.date=di.value;di.setAttribute("aria-label","日期");
    const sb=el("button","btn primary","记一笔");sb.type="submit";
    r1.appendChild(ai);r1.appendChild(ni);r1.appendChild(di);r1.appendChild(sb);f.appendChild(r1);
    f.onsubmit=e=>{e.preventDefault();const v=parseFloat(ai.value);if(isNaN(v)||v<=0){toast("请填一个大于 0 的金额");ai.focus();return}
      const d=di.value||tk;add({id:uid(),date:d,amt:Math.round(v*100)/100,cat:draft.cat,note:ni.value.trim(),src:""});
      draft.amt="";draft.note="";toast("记下了："+draft.cat+" "+money(v)+(budget?"，本月已用 "+money((months[mk]||[]).reduce((s,x)=>s+x.amt,0))+" / "+money(budget):""));
      const n=document.getElementById("expAmt");if(n)n.focus()};
    box.appendChild(f);
    // breakdown
    if(mTot>0){const by={};mList.forEach(x=>by[x.cat]=(by[x.cat]||0)+x.amt);const ent=Object.entries(by).sort((a,b)=>b[1]-a[1]);
      const brk=el("div","exp-break");brk.appendChild(el("p","pay-sec",(now.getMonth()+1)+"月花在哪里"));
      const stk=el("div","exp-stack");ent.forEach(([c,v])=>{const i=el("i");i.style.setProperty("--h",hueOf(c));i.style.width=(v/mTot*100)+"%";i.title=c+" "+money(v);stk.appendChild(i)});brk.appendChild(stk);
      const lg=el("div","exp-legend");ent.forEach(([c,v])=>{const s=el("span");const i=el("i");i.style.setProperty("--h",hueOf(c));s.appendChild(i);s.appendChild(document.createTextNode(c+" "));s.appendChild(el("b",null,money(v)));s.appendChild(document.createTextNode(" · "+Math.round(v/mTot*100)+"%"));lg.appendChild(s)});
      brk.appendChild(lg);box.appendChild(brk)}
    // list by day
    const list=all().sort((x,y)=>x.date<y.date?1:x.date>y.date?-1:0);
    const days={};list.forEach(x=>(days[x.date]=days[x.date]||[]).push(x));
    const keys=Object.keys(days).sort().reverse(),shown=showAll?keys:keys.slice(0,7);
    const dv=el("div","exp-days");
    if(!keys.length)dv.appendChild(el("p","note","还没有记录。选一个分类，填金额，点「记一笔」。在计划里给「购物 / 采购」写上金额并打勾，也会自动记进来。"));
    shown.forEach(k=>{const d=parse(k),g=el("div","exp-day"),h4=el("h4");h4.appendChild(el("span",null,(d.getMonth()+1)+"月"+d.getDate()+"日 "+WD[d.getDay()]+(k===tk?" · 今天":"")));
      h4.appendChild(el("b",null,money(days[k].reduce((s,x)=>s+x.amt,0))));g.appendChild(h4);
      days[k].forEach(x=>{const r=el("div","exp-it");const c=el("span","c",x.cat);c.style.setProperty("--h",hueOf(x.cat));r.appendChild(c);
        const n=el("span","n",x.note||"—");if(x.src)n.appendChild(el("span","src"," · 来自计划"));r.appendChild(n);
        r.appendChild(el("span","a",money(x.amt)));
        const del=el("button","x","✕");del.type="button";del.setAttribute("aria-label","删除这笔");del.onclick=()=>{remove(x.id);toast("已删除")};r.appendChild(del);g.appendChild(r)});
      dv.appendChild(g)});
    box.appendChild(dv);
    if(keys.length>7){const mb=el("button","btn",showAll?"收起":"查看全部 "+keys.length+" 天");mb.type="button";mb.style.alignSelf="flex-start";mb.onclick=()=>{showAll=!showAll;render()};box.appendChild(mb)}
  }
  window.__expensesRender=render;
  render();notify();
  if(!(window.claude&&window.claude.use))return;
  Promise.all([window.claude.use("db"),window.claude.use("user")]).then(([db,user])=>{
    if(!db||!user)return;
    return user.id().then(id=>{if(!id)return;
      const c=db.doc("data/users/"+id+"/spend").collection("months");setRef=db.doc("data/users/"+id+"/spendcfg");let first=true;
      c.onSnapshot(s=>{
        if(first&&s.empty&&!s.metadata.fromCache){first=false;col=c;Object.keys(months).forEach(saveMonth);return}
        if(!s.metadata.fromCache)first=false;col=c;if(s.metadata.hasPendingWrites)return;
        const m={};s.docs.forEach(d=>{const v=d.data();if(v&&v.list)m[d.id]=JSON.parse(JSON.stringify(v.list))});months=m;cache();render();notify()},()=>{col=null});
      setRef.onSnapshot(s=>{if(s.exists&&!s.metadata.hasPendingWrites){const v=JSON.parse(JSON.stringify(s.data()));budget=+v.budget||0;wk=v.wk||{};cache();render();notify()}},()=>{});
    });
  }).catch(()=>{});
})();