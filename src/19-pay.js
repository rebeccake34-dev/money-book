(function(){
  const box=document.getElementById("paySec");if(!box)return;
  const KEY="pay-sync-v1";
  window.__pay=()=>data.payslips;
  window.__bk=window.__bk||{};
  window.__bk.pay={dump:()=>JSON.parse(JSON.stringify(data)),
    merge:d=>{if(!d||!Array.isArray(d.payslips))return 0;const newer=(d.syncedAt||"")>(data.syncedAt||"")||d.payslips.length>data.payslips.length;if(!newer)return 0;
      data={payslips:d.payslips,shifts:d.shifts||[],syncedAt:d.syncedAt||null};try{localStorage.setItem(KEY,JSON.stringify(data))}catch(e){}render();try{window.__savingsRender&&window.__savingsRender()}catch(e){}return 1}};
  let data={payslips:[],shifts:[],syncedAt:null};
  try{const c=JSON.parse(localStorage.getItem(KEY)||"null");if(c)data=Object.assign(data,c)}catch(e){}
  const WD=["周日","周一","周二","周三","周四","周五","周六"];
  const pad=n=>String(n).padStart(2,"0");
  const ymd=d=>d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate());
  const parse=k=>{const p=k.split("-");return new Date(+p[0],+p[1]-1,+p[2])};
  const md=k=>{const d=parse(k);return (d.getMonth()+1)+"/"+d.getDate()};
  const money=n=>"$"+Number(n||0).toLocaleString("en-AU",{minimumFractionDigits:2,maximumFractionDigits:2});
  const el=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
  const toMin=t=>{const p=t.split(":");return +p[0]*60+ +p[1]};
  let showAll=false;
  function fyStart(d){return d.getMonth()>=6?d.getFullYear()+"-07-01":(d.getFullYear()-1)+"-07-01"}
  function render(){
    box.textContent="";
    const now=new Date(),tk=ymd(now),mk=tk.slice(0,7),fy=fyStart(now);
    const ps=data.payslips.slice().sort((a,b)=>a.paid<b.paid?1:-1);
    const h=el("div","pay-head");h.appendChild(el("h2",null,"工资与排班"));
    h.appendChild(el("span","pay-src",data.syncedAt?"来自邮箱的工资单和排班 · "+md(data.syncedAt.slice(0,10))+" 同步":"来自邮箱的工资单和排班"));
    box.appendChild(h);
    if(!ps.length&&!data.shifts.length){box.appendChild(el("p","pay-empty","还没有同步工资单和排班。在 Claude 里说「同步我的工资单和排班」，就会从 Gmail 拉取到这里。"));return}
    // stats
    const inM=ps.filter(p=>p.paid.slice(0,7)===mk),inFY=ps.filter(p=>p.paid>=fy);
    const sum=(a,f)=>a.reduce((s,x)=>s+(+x[f]||0),0);
    const fyNet=sum(inFY,"net"),fyHrs=sum(inFY,"hours"),fyGross=sum(inFY,"gross");
    const wk=new Date(now);wk.setDate(now.getDate()-((now.getDay()+6)%7));const ws=ymd(wk);const we=new Date(wk);we.setDate(wk.getDate()+6);const wek=ymd(we);
    const wkShifts=data.shifts.filter(s=>s.date>=ws&&s.date<=wek),wkH=wkShifts.reduce((a,s)=>a+(toMin(s.end)-toMin(s.start))/60,0);
    const st=el("div","pay-stats");
    [["本月到手",money(sum(inM,"net")),inM.length+" 张工资单"],["本财年到手",money(fyNet),"已同步 "+inFY.length+" 张 · 税前 "+money(fyGross)],
     ["本财年工时",fyHrs.toFixed(1)+" h","平均到手 "+money(fyHrs?fyNet/fyHrs:0)+"/h"],["本周排班",wkShifts.length+" 班",wkH.toFixed(1)+" 小时（未扣休息）"]]
     .forEach(([a,b,c])=>{const d=el("div","pay-stat");d.appendChild(el("small",null,a));d.appendChild(el("b",null,b));d.appendChild(el("span",null,c));st.appendChild(d)});
    box.appendChild(st);
    // chart: weekly net, oldest→newest
    const emps=[...new Set(ps.map(p=>p.employer))],empIdx=e=>emps.indexOf(e);
    const chartData=ps.slice(0,16).reverse();
    if(chartData.length>1){
      const W=600,H=150,L=44,R=8,T=14,B=24,mx=Math.max(...chartData.map(p=>p.net)),top=Math.ceil(mx/250)*250||250;
      const cw=(W-L-R)/chartData.length,bw=Math.min(26,cw*.6),y=v=>T+(1-v/top)*(H-T-B);
      let s="";for(let v=0;v<=top;v+=top/2){s+=`<line x1="${L}" x2="${W-R}" y1="${y(v)}" y2="${y(v)}" stroke="var(--line)"/><text x="${L-6}" y="${y(v)+4}" text-anchor="end" font-size="10" fill="var(--muted)" font-family="var(--mono)">$${Math.round(v)}</text>`}
      chartData.forEach((p,i)=>{const x=L+cw*i+(cw-bw)/2,yy=y(p.net),hh=y(0)-yy,anz=empIdx(p.employer)%2===1;
        s+=`<rect x="${x}" y="${yy}" width="${bw}" height="${Math.max(0,hh)}" rx="3" fill="${anz?"var(--gold)":"var(--accent)"}" opacity="${i===chartData.length-1?1:.7}"><title>${md(p.paid)} ${p.employer} 到手 ${money(p.net)}</title></rect>`;
        if(i%2===chartData.length%2||i===chartData.length-1)s+=`<text x="${x+bw/2}" y="${H-8}" text-anchor="middle" font-size="10" fill="var(--muted)">${md(p.paid)}</text>`});
      const c=el("div","pay-chart");c.innerHTML=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="每次发薪的到手金额">${s}</svg>`;
      c.appendChild(el("p","note","每根柱子是一次发薪的到手金额，按发薪日排列。"+(emps.length>1?emps.slice(0,2).map((e,i)=>(i?"金色：":"蓝色：")+e).join("，")+"。":"")));box.appendChild(c);
    }
    // shifts
    const up=data.shifts.filter(s=>s.date>=ws).sort((a,b)=>a.date<b.date?-1:1);
    box.appendChild(el("p","pay-sec","排班 · 本周起"));
    const sl=el("div","pay-shifts");
    if(!up.length)sl.appendChild(el("p","pay-empty","本周还没有排班邮件。"));
    up.forEach(s=>{const r=el("div","pay-shift"+(s.date<tk?" past":s.date===tk?" today":""));
      const d=el("div");d.appendChild(el("div","d",md(s.date)));d.appendChild(el("div","w",WD[parse(s.date).getDay()]+(s.date===tk?" · 今天":"")));
      const m=el("div");m.appendChild(document.createTextNode(s.start+"–"+s.end+" "+s.store));if(s.cash)m.appendChild(el("span","pay-tag","收银"));
      r.appendChild(d);r.appendChild(m);r.appendChild(el("span","h",((toMin(s.end)-toMin(s.start))/60).toFixed(1)+" h"));sl.appendChild(r)});
    box.appendChild(sl);
    // payslips
    box.appendChild(el("p","pay-sec","工资单"));
    const list=el("div","pay-list");
    (showAll?ps:ps.slice(0,6)).forEach(p=>{
      const dt=el("details","pay-row"),sm=el("summary");
      const a=el("div");a.appendChild(el("div","p1",md(p.from)+"–"+md(p.to)+" · "+p.employer));
      a.appendChild(el("div","p2",md(p.paid)+" 发薪 · "+(+p.hours).toFixed(2).replace(/\.?0+$/,"")+" 小时"));
      const b=el("div");b.appendChild(el("div","net",money(p.net)));b.appendChild(el("div","gr","税前 "+money(p.gross)));
      sm.appendChild(a);sm.appendChild(b);dt.appendChild(sm);
      const det=el("div","pay-detail"),tb=el("table");
      tb.innerHTML="<thead><tr><th>项目</th><th class='n'>小时</th><th class='n'>时薪</th><th class='n'>金额</th></tr></thead>";
      const body=el("tbody");
      p.lines.forEach(l=>{const tr=el("tr");[l.name,l.hours?(+l.hours).toFixed(2):"–",l.rate?money(l.rate):"–",money(l.amount)].forEach((v,i)=>{const td=el("td",i?"n":"",v);tr.appendChild(td)});body.appendChild(tr)});
      [["扣税 PAYG","−"+money(p.tax)],["到手","="+money(p.net)],["养老金（雇主另付）",money(p.super)]].forEach(([k,v])=>{const tr=el("tr");tr.appendChild(el("td",null,k));const td=el("td","n",v);td.colSpan=3;tr.appendChild(td);body.appendChild(tr)});
      tb.appendChild(body);det.appendChild(tb);dt.appendChild(det);list.appendChild(dt);
    });
    box.appendChild(list);
    if(ps.length>6){const mb=el("button","btn pay-more",showAll?"收起":"查看全部 "+ps.length+" 张");mb.type="button";mb.onclick=()=>{showAll=!showAll;render()};box.appendChild(mb)}
  }
  render();
  if(!(window.claude&&window.claude.use))return;
  Promise.all([window.claude.use("db"),window.claude.use("user")]).then(([db,user])=>{
    if(!db||!user)return;
    return user.id().then(id=>{if(!id)return;
      db.doc("data/users/"+id+"/paysync").onSnapshot(s=>{if(!s.exists)return;const v=JSON.parse(JSON.stringify(s.data()));
        data={payslips:v.payslips||[],shifts:v.shifts||[],syncedAt:v.syncedAt||null};
        try{localStorage.setItem(KEY,JSON.stringify(data))}catch(e){}render();try{window.__savingsRender&&window.__savingsRender()}catch(e){}try{window.__onShifts&&window.__onShifts(data.shifts)}catch(e){}},()=>{});
    });
  }).catch(()=>{});
})();