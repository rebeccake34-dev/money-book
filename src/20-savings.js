(function(){
  const box=document.getElementById("savSec");if(!box)return;
  const KEY="savings-v1";
  const DEF={goal:10000,goalNote:"",start:null,startDate:null,entries:[],pct:10,
    costs:[{name:"房租",amt:0,per:"week"},{name:"交通",amt:0,per:"week"},{name:"话费",amt:0,per:"month"}]};
  let S=JSON.parse(JSON.stringify(DEF));
  try{const c=JSON.parse(localStorage.getItem(KEY)||"null");if(c)S=Object.assign(S,c)}catch(e){}
  let ref=null,setOpen=false,draft={amt:"",note:""};
  const pad=n=>String(n).padStart(2,"0");
  const ymd=d=>d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate());
  const parse=k=>{const p=k.split("-");return new Date(+p[0],+p[1]-1,+p[2])};
  const md=k=>{const d=parse(k);return (d.getMonth()+1)+"/"+d.getDate()};
  const money=n=>(n<0?"−":"")+"$"+Math.abs(+n||0).toLocaleString("en-AU",{minimumFractionDigits:2,maximumFractionDigits:2});
  const money0=n=>"$"+Math.round(+n||0).toLocaleString("en-AU");
  const el=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
  const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);
  const toast=m=>{try{const t=document.getElementById("toast");t.textContent=m;t.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(()=>t.hidden=true,3000)}catch(e){}};
  let tm=null;
  function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}
    if(!ref)return;clearTimeout(tm);tm=setTimeout(()=>{ref.set(JSON.parse(JSON.stringify(S))).catch(()=>toast("储蓄没保存上，稍后再试"))},400)}
  function transfers(){try{const L=window.__ledger;return L&&L.transfers?L.transfers():{}}catch(e){return {}}}
  function records(){
    const out=S.entries.map(e=>({...e,src:"手动"}));
    const tr=transfers();Object.keys(tr).forEach(ws=>{if(S.startDate&&ws<S.startDate)return;out.push({id:"tr-"+ws,date:ws,amt:+tr[ws],note:"本周省下的钱",src:"账本"})});
    return out.sort((a,b)=>a.date<b.date?1:a.date>b.date?-1:0);
  }
  function weeklyCosts(){return S.costs.reduce((a,c)=>a+(+c.amt||0)*(c.per==="month"?12/52:c.per==="2week"?.5:1),0)}
  function payslips(){try{return (window.__pay&&window.__pay())||[]}catch(e){return []}}
  function calcS(){
    const recs=records(),dep=recs.reduce((s,r)=>s+r.amt,0),bal=(+S.start||0)+dep,goal=+S.goal||0,pct=goal?Math.min(1,Math.max(0,bal/goal)):0;
    const now=new Date(),tk=ymd(now),mk=tk.slice(0,7);
    const ps=payslips().slice().sort((x,y)=>x.paid<y.paid?1:-1).slice(0,4);
    const avgNet=ps.length?ps.reduce((s,p)=>s+p.net,0)/ps.length:null,wc=weeklyCosts(),ve=(window.__expenses&&window.__expenses.weeklyAvg())||null,vc=ve?ve.avg:0,cap=avgNet!=null?avgNet-wc-vc:null;
    const monthIn=recs.filter(r=>r.date.slice(0,7)===mk).reduce((s,r)=>s+r.amt,0);
    const since=new Date(now);since.setDate(now.getDate()-56);let sk=ymd(since);
    const first=S.startDate||(recs.length?recs[recs.length-1].date:tk);if(first>sk)sk=first;
    const spanW=Math.min(8,(now-parse(sk))/6048e5);
    const recent=spanW>=2?recs.filter(r=>r.date>=sk).reduce((s,r)=>s+r.amt,0)/spanW:0;
    const pace=recent>0?recent:(cap>0?cap:0);
    let eta="—",etaSub="开始存钱后会算出来",wks=null;
    if(bal>=goal&&goal){eta="已达成";etaSub="恭喜，目标已经存够了"}
    else if(pace>0){wks=Math.ceil((goal-bal)/pace);const d=new Date(now);d.setDate(d.getDate()+wks*7);eta=d.getFullYear()+"年"+(d.getMonth()+1)+"月";etaSub=(recent>0?"按近 "+Math.round(spanW)+" 周平均每周存 ":"按每周可存 ")+money0(pace)+"，约 "+wks+" 周"}
    const w0=new Date(now);w0.setDate(now.getDate()-((now.getDay()+6)%7));const wsk=ymd(w0),weekIn=recs.filter(r=>r.date>=wsk).reduce((s,r)=>s+r.amt,0);
    return {recs,bal,goal,pct,now,tk,mk,ps,avgNet,wc,ve,vc,cap,monthIn,spanW,recent,pace,eta,etaSub,wks,weekIn};
  }
  window.__savings={monthIn:mk=>records().filter(r=>r.date.slice(0,7)===mk).reduce((s,r)=>s+r.amt,0),stats:()=>{const c=calcS();return {bal:c.bal,goal:c.goal,pct:c.pct,pace:c.pace,eta:c.eta,etaSub:c.etaSub,wks:c.wks,weekIn:c.weekIn,started:S.start!=null||c.recs.length>0,money:money,money0:money0}}};
  window.__bk=window.__bk||{};
  window.__bk.savings={dump:()=>JSON.parse(JSON.stringify(S)),
    merge:d=>{if(!d)return 0;let n=0;const ids=new Set(S.entries.map(e=>e.id)),pays=new Set(S.entries.filter(e=>e.pay).map(e=>e.pay));
      (d.entries||[]).forEach(e=>{if(!e||!e.id||ids.has(e.id)||(e.pay&&pays.has(e.pay)))return;S.entries.push(e);ids.add(e.id);n++});
      if(S.start==null&&d.start!=null){S.start=d.start;S.startDate=d.startDate||S.startDate;if(+d.goal>0)S.goal=+d.goal;S.goalNote=d.goalNote||S.goalNote;if(Array.isArray(d.costs))S.costs=d.costs;if(d.pct)S.pct=d.pct;n++}
      if(n)save();const a=document.activeElement;if(a&&box.contains(a)&&a.blur)a.blur();render();return n}};
  function render(){
    const a=document.activeElement;if(a&&box.contains(a)&&a.tagName==="INPUT"&&a.type!=="checkbox")return;
    box.textContent="";
    const {recs,bal,goal,pct,now,tk,mk,ps,avgNet,wc,ve,vc,cap,monthIn,spanW,recent,pace,eta,etaSub,wks}=calcS();
    const h=el("div","sav-head");h.appendChild(el("h2",null,"储蓄"));
    h.appendChild(el("span","sav-goal","目标 "+money0(goal)+(S.goalNote?"（"+S.goalNote+"）":"")));box.appendChild(h);
    if(S.start==null){const st=el("div","sav-start");st.appendChild(el("span",null,"先填一下你现在已经存了多少："));
      const i=el("input");i.type="number";i.id="savStart";i.min="0";i.step="1";i.inputMode="decimal";i.placeholder="例如 5000";
      const b=el("button","btn primary","确定");b.type="button";
      b.onclick=()=>{const v=parseFloat(i.value);if(isNaN(v)||v<0){toast("请填 0 或以上的金额");return}S.start=v;S.startDate=tk;save();render();toast("已记下：目前存款 "+money(v))};
      st.appendChild(i);st.appendChild(b);box.appendChild(st);}
    const big=el("div","sav-big");big.appendChild(el("b",null,money(bal)));
    big.appendChild(el("span",null,Math.round(pct*100)+"% · 还差 "+money(Math.max(0,goal-bal))));box.appendChild(big);
    const bar=el("div","sav-bar");bar.setAttribute("role","progressbar");bar.setAttribute("aria-valuenow",Math.round(pct*100));bar.setAttribute("aria-valuemin","0");bar.setAttribute("aria-valuemax","100");
    const fill=el("i");fill.style.width=(pct*100)+"%";bar.appendChild(fill);
    [25,50,75].forEach(p=>{const u=el("u");u.style.left=p+"%";bar.appendChild(u)});box.appendChild(bar);
    const tks=el("div","sav-ticks");[0,.25,.5,.75,1].forEach(p=>tks.appendChild(el("span",null,money0(goal*p))));box.appendChild(tks);
    // stats
    const st=el("div","sav-stats");
    [["本月存入",money(monthIn),recs.filter(r=>r.date.slice(0,7)===mk).length+" 笔"],
     ["每周可存",cap==null?"—":money(cap),cap==null?"同步工资单后计算":"到手均值 "+money0(avgNet)+" − 固定 "+money0(wc)+(ve?" − 日常 "+money0(vc):"")+" /周"],
     ["预计存够",eta,etaSub]].forEach(([x,y,z])=>{const d=el("div","sav-stat");d.appendChild(el("small",null,x));d.appendChild(el("b",null,y));d.appendChild(el("span",null,z));st.appendChild(d)});
    box.appendChild(st);
    if(goal&&bal<goal){const fb=el("div","sav-fast");
      if(pace>0){fb.appendChild(el("b",null,"想提前存够"));
        [20,50,100].forEach(x=>{const w2=Math.ceil((goal-bal)/(pace+x)),d=new Date(now);d.setDate(d.getDate()+w2*7);
          fb.appendChild(el("span",null,"每周多存 "+money0(x)+" → "+d.getFullYear()+"年"+(d.getMonth()+1)+"月"+(wks-w2>0?"，早 "+(wks-w2)+" 周":"")))});}
      else fb.appendChild(el("span",null,"还算不出存钱速度：存入一笔，或者等工资单同步后，这里会显示预计日期。"));
      box.appendChild(fb)}
    // add form
    const f=el("form","sav-form");f.noValidate=true;
    const ai=el("input");ai.type="number";ai.id="savAmt";ai.min="0";ai.step="0.01";ai.inputMode="decimal";ai.placeholder="金额";ai.value=draft.amt;ai.oninput=()=>draft.amt=ai.value;
    const ni=el("input");ni.type="text";ni.id="savNote";ni.placeholder="备注（可不填）";ni.maxLength=60;ni.value=draft.note;ni.oninput=()=>draft.note=ni.value;
    const add=(sign)=>{const v=parseFloat(ai.value);if(isNaN(v)||v<=0){toast("请填一个大于 0 的金额");ai.focus();return}
      S.entries.push({id:uid(),date:tk,amt:Math.round(sign*v*100)/100,note:ni.value.trim()});draft={amt:"",note:""};save();render();
      toast(sign>0?"已存入 "+money(v):"已记录取出 "+money(v))};
    const b1=el("button","btn primary","存入");b1.type="submit";const b2=el("button","btn","取出");b2.type="button";b2.onclick=()=>add(-1);
    f.onsubmit=e=>{e.preventDefault();add(1)};
    f.appendChild(ai);f.appendChild(ni);f.appendChild(b1);f.appendChild(b2);box.appendChild(f);
    const q=el("div","sav-quick");
    if(ps.length){const lp=ps[0],already=S.entries.some(e=>e.pay===lp.id);
      if(!already)[10,20,30].forEach(p=>{const amt=Math.round(lp.net*p)/100;const b=el("button","btn",md(lp.paid)+" 工资存 "+p+"%："+money(amt));b.type="button";
        b.onclick=()=>{S.entries.push({id:uid(),date:tk,amt,note:md(lp.paid)+" 工资的 "+p+"%",pay:lp.id});save();render();toast("已存入 "+money(amt))};q.appendChild(b)});
      else q.appendChild(el("span","note",md(lp.paid)+" 的工资已经存过一笔了"));}
    if(q.childNodes.length)box.appendChild(q);
    // records
    const lst=el("div","sav-list");
    if(!recs.length)lst.appendChild(el("p","note","还没有存钱记录。上面填金额点「存入」，或者在绿色卡片里点「已转入」，都会记在这里。"));
    recs.slice(0,8).forEach(r=>{const row=el("div","sav-row");row.appendChild(el("span","d",md(r.date)));
      const m=el("div");m.appendChild(document.createTextNode(r.note||"存入"));m.appendChild(el("span","src"," · "+r.src));row.appendChild(m);
      row.appendChild(el("span","a"+(r.amt<0?" neg":""),(r.amt>0?"+":"")+money(r.amt)));
      if(r.src==="手动"){const x=el("button","x","✕");x.type="button";x.setAttribute("aria-label","删除这笔记录");
        x.onclick=()=>{S.entries=S.entries.filter(e=>e.id!==r.id);save();render();toast("已删除这笔记录")};row.appendChild(x)}else row.appendChild(el("span"));
      lst.appendChild(row)});
    box.appendChild(lst);
    // settings
    const dt=el("details","card sav-set");dt.style.padding="10px 12px";if(setOpen)dt.open=true;dt.ontoggle=()=>setOpen=dt.open;
    dt.appendChild(el("summary",null,"目标、已有存款和固定开支"));
    const row1=el("div","sav-form");
    const gi=el("input");gi.type="number";gi.id="savGoal";gi.min="0";gi.value=S.goal;gi.setAttribute("aria-label","目标金额");
    const gn=el("input");gn.type="text";gn.id="savGoalNote";gn.value=S.goalNote||"";gn.placeholder="备注，如 ¥100,000";gn.setAttribute("aria-label","目标备注");
    const si=el("input");si.type="number";si.id="savStartEdit";si.min="0";si.value=S.start==null?"":S.start;si.placeholder="已有存款";si.setAttribute("aria-label","已有存款");
    const sb=el("button","btn primary","保存");sb.type="button";
    sb.onclick=()=>{const g=parseFloat(gi.value),s0=si.value===""?null:parseFloat(si.value);if(isNaN(g)||g<=0){toast("目标要大于 0");return}
      S.goal=g;S.goalNote=gn.value.trim();if(s0!=null&&!isNaN(s0)){S.start=s0;if(!S.startDate)S.startDate=tk}save();render();toast("已保存")};
    const lab=(t,i)=>{const l=el("label");l.style.flex="1 1 120px";l.appendChild(document.createTextNode(t));l.appendChild(i);return l};
    row1.appendChild(lab("目标 AUD",gi));row1.appendChild(lab("目标备注",gn));row1.appendChild(lab("已有存款",si));row1.appendChild(sb);dt.appendChild(row1);
    dt.appendChild(el("p","note","「已有存款」是开始用这个板块时卡里已有的钱；之后的存入和取出会在它上面累加。"));
    dt.appendChild(el("b",null,"固定开支（用来算每周可存）"));
    S.costs.forEach((c,i)=>{const r=el("div","sav-cost");
      const n=el("input");n.type="text";n.value=c.name;n.id="savCN"+i;n.setAttribute("aria-label","开支名称");
      const v=el("input");v.type="number";v.min="0";v.value=c.amt;v.id="savCA"+i;v.setAttribute("aria-label","金额");
      const p=el("select");p.id="savCP"+i;[["week","每周"],["2week","每两周"],["month","每月"]].forEach(o=>{const op=el("option",null,o[1]);op.value=o[0];p.appendChild(op)});p.value=c.per;
      const ch=()=>{c.name=n.value.trim()||c.name;c.amt=parseFloat(v.value)||0;c.per=p.value;save()};n.onchange=ch;v.onchange=()=>{ch();render()};p.onchange=()=>{ch();render()};
      const x=el("button","btn","删除");x.type="button";x.onclick=()=>{S.costs.splice(i,1);save();render()};
      r.appendChild(n);r.appendChild(v);r.appendChild(p);r.appendChild(x);dt.appendChild(r)});
    const ab=el("button","btn","＋ 添加一项开支");ab.type="button";ab.style.alignSelf="flex-start";ab.onclick=()=>{S.costs.push({name:"新开支",amt:0,per:"month"});save();render()};
    dt.appendChild(ab);dt.appendChild(el("p","note","合计约每周 "+money(wc)+"。"));
    box.appendChild(dt);
    try{const v=document.getElementById("ovSavV"),s=document.getElementById("ovSavS");if(v){v.textContent=money0(bal)+" · "+Math.round(pct*100)+"%";s.textContent="目标 "+money0(goal)+" · 还差 "+money0(Math.max(0,goal-bal))}}catch(e){}
  }
  window.__savingsRender=render;
  render();
  if(!(window.claude&&window.claude.use))return;
  Promise.all([window.claude.use("db"),window.claude.use("user")]).then(([db,user])=>{
    if(!db||!user)return;
    return user.id().then(id=>{if(!id)return;ref=db.doc("data/users/"+id+"/savings");let first=true;
      ref.onSnapshot(s=>{if(s.metadata.hasPendingWrites)return;
        if(!s.exists){if(first&&!s.metadata.fromCache){first=false;save()}return}
        first=false;S=Object.assign(JSON.parse(JSON.stringify(DEF)),JSON.parse(JSON.stringify(s.data())));
        try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}render()},()=>{ref=null});
    });
  }).catch(()=>{});
})();