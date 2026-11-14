/* 今天首页 · 每周小结 · 数据备份（导出 / 导入合并） */
(function(){
  var $=function(id){return document.getElementById(id)};
  var root=$("todayView");if(!root)return;
  var rm=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;
  function el(t,c,x){var e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e}
  function btn(c,x,f,id){var b=el("button",c,x);b.type="button";if(id)b.id=id;b.onclick=f;return b}
  function toast(m){try{window.__toastAny&&window.__toastAny(m)}catch(e){}}
  function pad(n){return String(n).padStart(2,"0")}
  function tkey(){var d=new Date();return d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate())}
  function lsGet(k){try{return localStorage.getItem(k)}catch(e){return null}}
  function lsSet(k,v){try{localStorage.setItem(k,v)}catch(e){}}
  function go(tab,id){if(typeof showTab==="function")showTab(tab);
    setTimeout(function(){var e=id&&$(id);if(!e){window.scrollTo(0,0);return}
      if(e.classList.contains("folded")){var h=e.firstElementChild;if(h)h.click()}
      e.scrollIntoView({behavior:rm?"auto":"smooth",block:"start"})},60)}
  function head(box,title,sub,onMore,moreTxt){var h=el("div","td-h");h.appendChild(el("b",null,title));h.appendChild(el("span","td-sub",sub||""));
    if(onMore)h.appendChild(btn("td-more",moreTxt||"详情 ›",onMore));box.appendChild(h)}

  /* ---------- 固定的卡片容器（表单不重建，输入时不会被打断） ---------- */
  var S={};["warn","hab","fit","food","exp","plan","cyc","week","month","sav"].forEach(function(k){S[k]=el(k==="warn"?"div":"section",k==="warn"?"":"td-card");S[k].id="td-"+k;root.appendChild(S[k])});
  var expHead=el("div"),expForm=el("form","td-form"),expAlert=el("p","td-alert");expForm.noValidate=true;expAlert.hidden=true;
  var expSel=el("select"),expAmt=el("input"),expNote=el("input"),expBtn=el("button","btn primary","记一笔");
  expSel.id="tdExpCat";expSel.setAttribute("aria-label","开支分类");
  expAmt.type="number";expAmt.id="tdExpAmt";expAmt.min="0";expAmt.step="0.01";expAmt.inputMode="decimal";expAmt.placeholder="金额";expAmt.setAttribute("aria-label","金额");
  expNote.type="text";expNote.id="tdExpNote";expNote.placeholder="买了什么（可不填）";expNote.maxLength=80;expNote.setAttribute("aria-label","备注");
  expBtn.type="submit";
  expForm.appendChild(expSel);expForm.appendChild(expAmt);expForm.appendChild(expBtn);expForm.appendChild(expNote);
  S.exp.appendChild(expHead);S.exp.appendChild(expForm);S.exp.appendChild(expAlert);
  expForm.onsubmit=function(ev){ev.preventDefault();var E=window.__expenses;if(!E)return;var v=parseFloat(expAmt.value);
    if(isNaN(v)||v<=0){toast("请填一个大于 0 的金额");expAmt.focus();return}
    var cat=expSel.value,note=expNote.value.trim();expAmt.value="";expNote.value="";
    E.add(v,cat,note,tkey(),"");var w=E.week();
    toast("记下了："+cat+" "+E.money(v)+(w.totalBudget?(w.left>=0?"，本周还能花 "+E.money(w.left):"，本周已超 "+E.money(-w.left)):""))};

  var foodHead=el("div"),foodChips=el("div","td-chips"),foodQ=el("input"),foodRes=el("div","td-fres");
  foodQ.type="search";foodQ.id="tdFoodQ";foodQ.placeholder="搜食物直接记：豆奶、蓝莓、虾…";foodQ.setAttribute("aria-label","搜索食物");
  S.food.appendChild(foodHead);S.food.appendChild(foodChips);S.food.appendChild(foodQ);S.food.appendChild(foodRes);
  function renderFoodRes(){var C=window.__cut;foodRes.textContent="";if(!C||!C.foodSearch)return;var q=foodQ.value.trim();if(!q)return;var r=C.foodSearch(q);
    if(!r.length){foodRes.appendChild(el("p","td-note","食物库里没找到。点右上角「食物库」可以自己填名称和热量。"));return}
    r.forEach(function(x){var b=btn("td-fitem",null,function(){C.addLib(x.i);foodQ.value="";renderFoodRes()},"tdFd"+x.i);
      b.appendChild(el("span",null,x.name+" · "+x.unit));b.appendChild(el("b",null,x.kcal+" kcal ＋"));foodRes.appendChild(b)})}
  foodQ.oninput=renderFoodRes;
  var lastEx=null,planAll=false,tidyOff={};
  var loadDay=tkey();
  function dayCheck(){if(tkey()===loadDay)return;var a=document.activeElement;if(a&&/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName)&&a.type!=="checkbox")return;try{location.reload()}catch(e){}}
  setInterval(dayCheck,30000);document.addEventListener("visibilitychange",function(){if(!document.hidden)dayCheck()});window.addEventListener("focus",dayCheck);

  function backupState(){var L=window.__ledger,local=!(L&&L.mode&&L.mode()==="db"),last=+lsGet("bk-last")||0,days=last?Math.floor((Date.now()-last)/864e5):null;
    var has=false;try{has=!!(L&&L.ready()&&(Object.keys(L.freq(120)).length||L.habits().some(function(h){return h.n>0})))}catch(e){}
    return {local:local,last:last,days:days,ready:!!(L&&L.ready()),warn:local&&has&&(!last||days>=7)}}

  function verdict(ws,cur){var L=window.__ledger,E=window.__expenses,out=[];if(!L||!L.ready())return out;
    var w=L.weekDetail(ws),p=L.weekDetail(L.addDays(ws,-7));
    if(w.rows.length){var d=w.net-p.net;
      out.push({t:"净省下 "+L.money(w.net)+(p.rows.length?"，比前一周"+(d>=0?"多 ":"少 ")+L.money(Math.abs(d)):""),k:w.net>=0?"good":"bad"});
      var g=w.rows.filter(function(r){return !r.bad&&r.amt>0}).sort(function(a,b){return b.amt-a.amt})[0];
      if(g)out.push({t:"省得最多：「"+g.name+"」"+g.n+" 次，共 "+L.money(g.amt),k:"good"});
      var b=w.rows.filter(function(r){return r.bad&&r.amt<0}).sort(function(a,b){return a.amt-b.amt})[0];
      if(b)out.push({t:"扣得最多：「"+b.name+"」"+b.n+" 次，共 "+L.money(-b.amt),k:"bad"});
    }else out.push({t:cur?"这周还没有打卡记录":"这一周没有打卡记录",k:""});
    if(E){var x=E.week(ws);
      if(x.over.length)out.push({t:"开支超预算："+x.over.map(function(o){return "「"+o[0]+"」超 "+E.money(o[1])}).join("、"),k:"bad"});
      else if(x.totalBudget&&x.total>0)out.push({t:"有预算的几类都没超：花了 "+E.money(x.used)+"，预算 "+E.money(x.totalBudget),k:"good"});
      if(x.total>0&&x.top)out.push({t:"开支共 "+E.money(x.total)+"，最多的是「"+x.top[0]+"」"+E.money(x.top[1]),k:""});}
    if(cur&&window.__savings){var s=window.__savings.stats();
      if(s.started&&s.goal&&s.bal<s.goal){
        if(s.weekIn>0)out.push({t:"本周已存 "+s.money(s.weekIn)+(s.wks?"，按现在的速度 "+s.eta+" 存够":""),k:"good"});
        else if(s.pace>0)out.push({t:"本周还没存钱；按现在的速度每周约存 "+s.money0(s.pace)+"，"+s.eta+" 存够",k:""});}}
    return out}
  function mverdict(y,m,cur){var L=window.__ledger,E=window.__expenses,out=[];if(!L||!L.ready())return out;var a=L.month(y,m);
    var pd0=new Date(y,m-1,1),pk=pd0.getFullYear()+"-"+pad(pd0.getMonth()+1),pdays=new Date(y,m,0).getDate(),dd=new Date().getDate(),pa=L.month(pd0.getFullYear(),pd0.getMonth());
    var cmp=cur?"上月同期（1–"+Math.min(dd,pdays)+" 日）":"前一个月";
    if(a.good.length||a.bad.length){
      out.push({t:"净省下 "+L.money(a.net)+"，其中当场省下 "+L.money(a.cash)+(a.transferred?"，已转入储蓄 "+L.money(a.transferred):""),k:a.net>=0?"good":"bad"});
      var pn=cur?L.range(pk+"-01",pk+"-"+pad(Math.min(dd,pdays))).net:pa.net;
      if(pa.good.length||pa.bad.length){var dn=a.net-pn;out.push({t:"比"+cmp+(dn>=0?"多省 ":"少省 ")+L.money(Math.abs(dn)),k:dn>=0?"good":"bad"})}
      var g=a.good.slice().sort(function(p,q){return q.amt-p.amt})[0];if(g&&g.amt>0)out.push({t:"省得最多：「"+g.name+"」"+g.n+" 次，共 "+L.money(g.amt),k:"good"});
      var b=a.bad[0];if(b&&b.amt<0)out.push({t:"扣得最多：「"+b.name+"」"+b.n+" 次，共 "+L.money(-b.amt),k:"bad"});
    }else out.push({t:cur?"这个月还没有打卡记录":"这个月没有打卡记录",k:""});
    if(E){var x=E.month(y,m),pd=new Date(y,m-1,1),px=E.month(pd.getFullYear(),pd.getMonth());
      var pt=cur?E.range(pk+"-01",pk+"-"+pad(Math.min(dd,pdays))):px.total;if(x.total>0){var d=x.total-pt;
        out.push({t:"开支 "+E.money(x.total)+(x.byCat[0]?"，最多的是「"+x.byCat[0][0]+"」"+E.money(x.byCat[0][1]):"")+(pt>0?"，比"+cmp+(d>=0?"多花 ":"少花 ")+E.money(Math.abs(d)):""),k:pt>0?(d>0?"bad":"good"):""});
        if(x.budget>0)out.push(x.total>x.budget?{t:"超出每月预算 "+E.money(x.total-x.budget),k:"bad"}:{t:"在每月预算内，"+(cur?"还剩 ":"剩下 ")+E.money(x.budget-x.total),k:"good"})}}
    if(window.__savings){var mi=window.__savings.monthIn(y+"-"+pad(m+1));var pmi=window.__savings.monthIn(pk),mny=window.__savings.stats().money;
      if(mi||pmi)out.push({t:(mi>=0?"存入储蓄 ":"储蓄净取出 ")+mny(Math.abs(mi))+(pmi?"（"+(cur?"上月全月 ":"前一个月 ")+mny(pmi)+"）":""),k:mi>0?"good":mi<0?"bad":""})}
    return out}
  function vlist(items){var u=el("ul","td-list");items.forEach(function(i){u.appendChild(el("li",i.k||null,i.t))});return u}

  function render(){
    if(root.hidden)return;
    var L=window.__ledger,C=window.__cut,E=window.__expenses,t=tkey(),box;
    // 备份提醒
    box=S.warn;box.textContent="";box.className="";
    var bk=backupState();
    if(bk.warn){box.className="td-warn";box.appendChild(el("span",null,bk.last?"已经 "+bk.days+" 天没备份了。记录只存在这台设备的浏览器里，清除浏览器数据就会丢。":"记录只存在这台设备的浏览器里，还没备份过。清除浏览器数据就会丢。"));
      box.appendChild(btn("btn","去备份",function(){go("set","secBackup")},"tdBk"))}
    // 习惯
    box=S.hab;box.textContent="";
    if(L&&L.ready()){var hs=L.habits(),fq=L.freq(28),top=hs.slice().sort(function(a,b){return (fq[b.id]||0)-(fq[a.id]||0)});
      var pick=top.filter(function(h){return fq[h.id]}).slice(0,8);
      if(pick.length<6)hs.forEach(function(h){if(pick.length<6&&pick.indexOf(h)<0&&h.kind==="cash"&&!h.ask)pick.push(h)});
      hs.forEach(function(h){if(h.n>0&&pick.indexOf(h)<0)pick.push(h)});
      var dn=hs.filter(function(h){return h.n>0}).length;
      head(box,"习惯打卡",dn?"今天已记 "+dn+" 个 · 常用的排在这里":"常用的排在这里，点一下记一次",function(){go("ledger","groups")},"全部习惯 ›");
      var g=el("div","td-chips");
      pick.forEach(function(h){var bad=h.kind.indexOf("bad")===0,w=el("div","td-chipw"+(h.n?" on":"")+(bad?" bad":""));
        var b=btn("td-chip td-keep",null,function(){L.tap(h.id)},"tdH-"+h.id);b.appendChild(el("span",null,h.name));b.appendChild(el("b",null,h.n?"×"+h.n:"＋"));w.appendChild(b);
        if(h.n){var u=btn("td-undo td-keep","撤销",function(){L.undo(h.id)},"tdU-"+h.id);u.setAttribute("aria-label","撤销一次："+h.name);w.appendChild(u)}
        g.appendChild(w)});
      box.appendChild(g);
    }else{head(box,"习惯打卡","正在读取记录…")}
    // 运动
    box=S.fit;box.textContent="";
    if(C){var T=C.today();head(box,"运动",T.plan,function(){go("cut","cutTrain")},"去打卡 ›");
      var r=el("div","td-row");r.appendChild(el("span","td-k","训练"));
      r.appendChild(el("span","td-v",T.exTotal?"动作 "+T.exDone+"/"+T.exTotal:(T.type==="train"?"今天有训练":"今天不练力量")));
      if(T.exTotal&&T.exDone<T.exTotal)r.appendChild(btn("td-btn td-keep","全部完成",function(){lastEx=C.checkAllEx();toast("已勾选今天的全部动作")},"tdExAll"));
      else if(lastEx&&lastEx.length)r.appendChild(btn("td-btn ghost td-keep","撤销",function(){var x=lastEx;lastEx=null;C.uncheckEx(x)},"tdExUndo"));
      box.appendChild(r);
      var r2=el("label","td-row"),ck=el("input");r2.appendChild(el("span","td-k","有氧"));r2.appendChild(el("span","td-v",T.cardio?"已完成":"还没做"));
      ck.type="checkbox";ck.id="tdCardio";ck.className="td-keep";ck.checked=!!T.cardio;ck.onchange=function(){C.setCardio(ck.checked)};r2.appendChild(ck);box.appendChild(r2);
      var r3=el("div","td-row"),wv=el("div","td-v"),bar=el("div","td-bar"),bi=el("i");r3.appendChild(el("span","td-k","喝水"));
      wv.appendChild(el("span",null,T.water+" / "+T.waterT+" ml"));bi.style.width=Math.min(100,T.waterT?T.water/T.waterT*100:0)+"%";bar.appendChild(bi);wv.appendChild(bar);r3.appendChild(wv);
      var wb=el("div","td-btns");C.cups().slice(0,3).forEach(function(ml,i){wb.appendChild(btn("td-btn td-keep","+"+ml,function(){C.addWater(ml)},"tdW"+i))});
      if(C.waterCount())wb.appendChild(btn("td-btn ghost td-keep","撤销",function(){C.undoWater()},"tdWU"));r3.appendChild(wb);box.appendChild(r3);
}
    // 饮食
    S.food.hidden=!(C&&C.quickFoods);
    if(C&&C.quickFoods){var T2=C.today();foodHead.textContent="";
      head(foodHead,"饮食","热量 "+T2.kcal+"/"+T2.kcalT+" · 蛋白质 "+T2.pro+"/"+T2.proT+" g",function(){go("cut","cutFood")},"食物库 ›");
      foodChips.textContent="";
      C.quickFoods(6).forEach(function(x,i){var w=el("div","td-chipw"+(x.n?" on":"")),b=btn("td-chip td-keep",null,function(){if(C.quickAdd(x.name))toast("已记录："+x.name+" "+x.kcal+" kcal")},"tdQF"+i);
        b.appendChild(el("span",null,x.name));b.appendChild(el("b",null,x.n?"×"+x.n:x.kcal+""));w.appendChild(b);
        if(x.n){var u=btn("td-undo td-keep","撤销",function(){C.undoFood(x.name)},"tdQU"+i);u.setAttribute("aria-label","撤销一次："+x.name);w.appendChild(u)}
        foodChips.appendChild(w)})}
    // 开支
    S.exp.hidden=!E;
    if(E){var W=E.week(),sp=E.day(t);expHead.textContent="";
      head(expHead,"开支","今天 "+E.money(sp)+" · "+(W.totalBudget?(W.left>=0?"本周还能花 "+E.money(W.left):"本周已超 "+E.money(-W.left)):"本周花了 "+E.money(W.total)),function(){go("ledger","expSec")});
      if(!expSel.options.length)E.cats().forEach(function(c){var o=el("option",null,c);o.value=c;expSel.appendChild(o)});
      expAlert.hidden=!W.over.length;expAlert.textContent=W.over.map(function(o){return "「"+o[0]+"」本周超预算 "+E.money(o[1])}).join(" · ");}
    // 计划
    box=S.plan;box.textContent="";
    if(window.__planToday){var items=window.__planToday(),pd=items.filter(function(i){return i.done}).length,mc=window.__planMemo?window.__planMemo():{over:0,today:0};
      head(box,"今天的计划",items.length?pd+"/"+items.length+" 项完成":"还没有安排",function(){window.__planSelect&&window.__planSelect(t)},items.length?"安排 ›":"去安排 ›");
      if(mc.over||mc.today){var ma=el("div","td-row");ma.appendChild(el("span","td-v td-alert",(mc.over?"过期备忘 "+mc.over+" 项":"")+(mc.over&&mc.today?" · ":"")+(mc.today?"今天到期 "+mc.today+" 项":"")));
        ma.appendChild(btn("td-btn","看备忘",function(){go("plan","plMemo")},"tdMemo"));box.appendChild(ma)}
      if(items.length){var pl=el("div","td-plist"),show=planAll?items:items.slice(0,8);
        show.forEach(function(i){var l=el("label","td-plan"+(i.done?" done":"")),c=el("input");c.type="checkbox";c.id="tdP-"+i.id;c.className="td-keep";c.checked=i.done;
          c.onchange=function(){window.__planToggle(i.id,c.checked)};l.appendChild(c);l.appendChild(el("span","t",i.start||"—"));l.appendChild(el("span","n",i.label));pl.appendChild(l)});
        box.appendChild(pl);
        if(items.length>8)box.appendChild(btn("td-btn ghost",planAll?"收起":"还有 "+(items.length-8)+" 项",function(){planAll=!planAll;render()},"tdPlanMore"))}}
    // 生理期
    box=S.cyc;box.textContent="";
    var cy=window.__cycleToday&&window.__cycleToday();
    if(cy){head(box,"生理期",cy.v,function(){go("cycle")});
      var cr=el("div","td-row");cr.appendChild(el("span","td-v td-note",cy.tip||cy.s));
      cr.appendChild(cy.ongoing?btn("td-btn td-keep","经期结束了",function(){window.__cycleEnd()},"tdCyEnd"):btn("td-btn td-keep","经期今天来了",function(){window.__cycleStart()},"tdCyStart"));
      box.appendChild(cr);if(cy.tip)box.appendChild(el("p","td-note",cy.s))}
    // 本周小结
    box=S.week;box.textContent="";
    if(L&&L.ready()){head(box,"本周小结","周一到今天",function(){go("ledger","secWeek")},"回顾 ›");box.appendChild(vlist(verdict(L.weekStart(t),true)))}
    // 本月小结
    box=S.month;box.textContent="";
    if(L&&L.ready()){var nd=new Date();head(box,"本月小结",(nd.getMonth()+1)+"月 1 日到今天",function(){go("ledger","secWeek")},"上月 ›");box.appendChild(vlist(mverdict(nd.getFullYear(),nd.getMonth(),true)))}
    // 储蓄
    box=S.sav;box.textContent="";
    if(window.__savings){var sv=window.__savings.stats();
      head(box,"储蓄",sv.started?sv.money0(sv.bal)+" · "+Math.round(sv.pct*100)+"%":"还没开始记录",function(){go("ledger","savSec")});
      if(sv.started){var sb=el("div","td-bar"),si=el("i");si.style.width=(sv.pct*100)+"%";sb.appendChild(si);box.appendChild(sb);
        box.appendChild(el("p","td-note",sv.bal>=sv.goal&&sv.goal?"目标已经存够了":"目标 "+sv.money0(sv.goal)+" · 还差 "+sv.money0(Math.max(0,sv.goal-sv.bal))+(sv.wks?" · 预计 "+sv.eta+" 存够":"")))}
      else box.appendChild(el("p","td-note","在「省钱账本 › 储蓄」里填上现有存款，这里会显示进度和预计存够的时间。"))}
  }
  function renderWeekV(){var box=$("weekVerdict"),L=window.__ledger;if(!box||!L||!L.ready())return;box.textContent="";var ws=L.weekStart();
    [["本周（周一到今天）",ws,true],["上周",L.addDays(ws,-7),false]].forEach(function(x){var d=el("div");d.appendChild(el("h3",null,x[0]));d.appendChild(vlist(verdict(x[1],x[2])));box.appendChild(d)});
    var n=new Date(),pm=new Date(n.getFullYear(),n.getMonth()-1,1);
    [[(n.getMonth()+1)+"月（到今天）",n.getFullYear(),n.getMonth(),true],[(pm.getMonth()+1)+"月",pm.getFullYear(),pm.getMonth(),false]].forEach(function(x){var d=el("div");d.appendChild(el("h3",null,x[0]));d.appendChild(vlist(mverdict(x[1],x[2],x[3])));box.appendChild(d)})}
  function renderTidy(){var box=$("tidyBody"),L=window.__ledger;if(!box)return;box.textContent="";
    if(!L||!L.ready()){box.appendChild(el("p","note","正在读取记录…"));return}
    var f=L.firstDay(),span=f?Math.round((new Date(tkey())-new Date(f))/864e5)+1:0;
    if(span<14){box.appendChild(el("p","note",f?"已经记录 "+span+" 天。用满 14 天后，这里会列出最近 4 周一次都没点过的习惯，可以一次隐藏。":"开始打卡 14 天后，这里会列出一次都没点过的习惯，可以一次隐藏。"));return}
    var use=L.usage(28),un=L.habits().filter(function(h){return !use[h.id]});
    if(!un.length){box.appendChild(el("p","note","最近 4 周每个习惯都点过，不用整理。"));return}
    box.appendChild(el("p","note","最近 4 周一次都没点过的有 "+un.length+" 个。勾选的会从打卡页隐藏，过去的记录不受影响；想恢复，到「省钱账本 › 习惯打卡」最下面的「已删除的习惯」里点恢复。"));
    var ls=el("div","tidy-list");
    un.forEach(function(h){var l=el("label","tidy-row"),c=el("input");c.type="checkbox";c.id="tidy-"+h.id;c.checked=!tidyOff[h.id];c.onchange=function(){if(c.checked)delete tidyOff[h.id];else tidyOff[h.id]=1;cnt()};
      l.appendChild(c);l.appendChild(el("span",null,h.name));ls.appendChild(l)});
    box.appendChild(ls);
    var row=el("div","bk-row"),go1=btn("btn primary","",function(){var ids=un.filter(function(h){return !tidyOff[h.id]}).map(function(h){return h.id});if(!ids.length){toast("先勾选要隐藏的习惯");return}
      L.hideMany(ids);toast("已隐藏 "+ids.length+" 个习惯");renderTidy();sched()},"tidyGo");
    function cnt(){go1.textContent="隐藏选中的 "+un.filter(function(h){return !tidyOff[h.id]}).length+" 个"}cnt();
    row.appendChild(go1);row.appendChild(btn("btn","全不选",function(){un.forEach(function(h){tidyOff[h.id]=1});renderTidy()},"tidyNone"));box.appendChild(row)}
  var timer=null;
  function sched(){clearTimeout(timer);timer=setTimeout(function(){try{render()}catch(e){try{window.__debugPush&&window.__debugPush("today",e)}catch(x){}}try{renderWeekV()}catch(e){}},40)}
  window.__todayRender=sched;
  window.__todayShown=function(){try{render()}catch(e){}};
  ["__overview","__cutRendered","__savingsRender"].forEach(function(n){var f=window[n];window[n]=function(){var r;try{r=f&&f.apply(this,arguments)}finally{sched()}return r}});

  /* ---------- 数据备份 ---------- */
  var bkBody=$("bkBody"),bkMode=null,bkPending=null,bkText="";
  function collect(){var L=window.__ledger;if(!L||!L.ready()){toast("还在读取记录，等几秒再试");return null}
    var B=window.__bk||{},o={app:"money-book",v:1,at:Date.now(),data:{}};
    Object.keys(B).forEach(function(k){try{o.data[k]=B[k].dump()}catch(e){}});
    o.data.theme=lsGet("theme-color");return o}
  function summary(d){var out=[],n;
    function cnt(o){return o?Object.keys(o).length:0}
    if(d.ledger){n=Object.keys(d.ledger.days||{}).filter(function(k){var c=d.ledger.days[k]||{};return Object.keys(c).some(function(i){return c[i]>0})}).length;
      out.push("习惯打卡 "+n+" 天"+((d.ledger.notes||[]).length?"，便签 "+d.ledger.notes.length+" 条":""))}
    if(d.exp){n=0;Object.keys(d.exp.months||{}).forEach(function(m){n+=(d.exp.months[m]||[]).length});out.push("开支 "+n+" 笔")}
    if(d.savings)out.push("储蓄记录 "+(d.savings.entries||[]).length+" 笔");
    if(d.cut)out.push("运动打卡 "+cnt(d.cut.days)+" 天");
    if(d.plan)out.push("日常计划 "+cnt(d.plan.days)+" 天"+((d.plan.memos||[]).length?"，备忘 "+d.plan.memos.length+" 条":""));
    if(d.cycle)out.push("生理期 "+(d.cycle.periods||[]).length+" 次，每天记录 "+cnt(d.cycle.logs)+" 天");
    if(d.pay&&(d.pay.payslips||[]).length)out.push("工资单 "+d.pay.payslips.length+" 张");
    return out}
  function mark(){lsSet("bk-last",String(Date.now()))}
  function exportFile(){var o=collect();if(!o)return;var fn="账本备份-"+tkey()+".json",blob=new Blob([JSON.stringify(o)],{type:"application/json"});
    var done=function(){mark();toast("备份文件已生成："+fn);renderBackup();sched()};
    if(window.claude&&window.claude.use){window.claude.use("downloads").then(function(dl){if(!dl){toast("这里不能下载文件，请用「复制备份文字」");return}
        return dl.save({filename:fn,data:blob}).then(function(r){if(r&&r.status==="saved")done()},function(e){if(e&&e.code!=="declined")toast("没能生成文件，请用「复制备份文字」")})}).catch(function(){toast("没能生成文件，请用「复制备份文字」")});return}
    var url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=fn;document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(url)},60000);done()}
  function copyText(){var o=collect();if(!o)return;var txt=JSON.stringify(o);
    var manual=function(){bkMode="copy";bkText=txt;renderBackup();var ta=$("bkCopyTa");if(ta){ta.focus();ta.select()}};
    if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(txt).then(function(){mark();toast("备份文字已复制，可以粘贴到备忘录或另一个入口里");renderBackup();sched()},manual);else manual()}
  function readText(txt){var o=null;try{o=JSON.parse(String(txt||"").trim())}catch(e){}
    if(!o||o.app!=="money-book"||!o.data||typeof o.data!=="object"){toast("这不是这个账本的备份，或者内容不完整");return}
    bkPending=o;bkMode="confirm";renderBackup()}
  function doMerge(){var o=bkPending,L=window.__ledger;if(!o)return;if(!L||!L.ready()){toast("还在读取记录，等几秒再试");return}
    var B=window.__bk||{},n=0,bad=0;
    ["ledger","exp","savings","cut","plan","cycle","pay"].forEach(function(k){if(!B[k]||!o.data[k])return;try{n+=B[k].merge(JSON.parse(JSON.stringify(o.data[k])))||0}catch(e){bad++;try{window.__debugPush&&window.__debugPush("merge-"+k,e)}catch(x){}}});
    if(o.data.theme&&!lsGet("theme-color")){lsSet("theme-color",o.data.theme)}
    bkPending=null;bkMode=null;renderBackup();sched();
    toast(bad?"合并了一部分，有 "+bad+" 个板块没成功，可以再导入一次":n?"合并完成：补上了 "+n+" 处记录":"两边已经一致，没有需要补的记录")}
  function renderBackup(){if(!bkBody)return;bkBody.textContent="";var st=backupState();
    bkBody.appendChild(el("p","bk-status",(st.local?"现在的记录存在这台设备的浏览器里。清除浏览器数据、换手机或换浏览器都看不到，记得定期备份。":"现在的记录存在你的账号里，换设备登录也能看到。")+" 上次备份："+(st.last?(st.days?st.days+" 天前":"今天"):"还没备份过")+"。"));
    var r1=el("div","bk-row");r1.appendChild(btn("btn primary","导出备份文件",exportFile,"bkExport"));r1.appendChild(btn("btn","复制备份文字",copyText,"bkCopy"));bkBody.appendChild(r1);
    if(bkMode==="copy"){var cb=el("div","bk-box");cb.appendChild(el("span","note","没能自动复制。下面的文字已经全选，按「复制」后粘贴到备忘录保存。"));
      var ta=el("textarea");ta.id="bkCopyTa";ta.readOnly=true;ta.value=bkText;cb.appendChild(ta);cb.appendChild(btn("btn","我复制好了",function(){mark();bkMode=null;bkText="";renderBackup();sched()},"bkCopied"));bkBody.appendChild(cb)}
    var fi=el("input");fi.type="file";fi.accept=".json,application/json,text/plain";fi.hidden=true;fi.id="bkFile";
    fi.onchange=function(){var f=fi.files&&fi.files[0];if(!f)return;var rd=new FileReader();rd.onload=function(){readText(rd.result)};rd.onerror=function(){toast("读不了这个文件")};rd.readAsText(f)};
    var r2=el("div","bk-row");r2.appendChild(btn("btn","从备份文件导入",function(){fi.value="";fi.click()},"bkImport"));
    r2.appendChild(btn("btn","粘贴备份文字导入",function(){bkMode=bkMode==="paste"?null:"paste";renderBackup();var p=$("bkPasteTa");if(p)p.focus()},"bkPaste"));r2.appendChild(fi);bkBody.appendChild(r2);
    if(bkMode==="paste"){var pb=el("div","bk-box"),pt=el("textarea");pt.id="bkPasteTa";pt.placeholder="把备份文字粘贴到这里";pb.appendChild(pt);
      var pr=el("div","bk-row");pr.appendChild(btn("btn primary","读取",function(){readText(pt.value)},"bkRead"));pr.appendChild(btn("btn","取消",function(){bkMode=null;renderBackup()},"bkPasteX"));pb.appendChild(pr);bkBody.appendChild(pb)}
    if(bkMode==="confirm"&&bkPending){var cf=el("div","bk-box"),d=new Date(bkPending.at||0),ul=el("ul");
      cf.appendChild(el("b",null,"这份备份（"+(bkPending.at?d.getFullYear()+"年"+(d.getMonth()+1)+"月"+d.getDate()+"日 "+pad(d.getHours())+":"+pad(d.getMinutes()):"时间不明")+"）里有："));
      summary(bkPending.data).forEach(function(t){ul.appendChild(el("li",null,t))});cf.appendChild(ul);
      cf.appendChild(el("span","note","合并只会补上这里缺少的记录，不会删除已有的。同一天两边都有时，保留次数多的或较新的那份。"));
      var cr=el("div","bk-row");cr.appendChild(btn("btn primary","确认合并",doMerge,"bkDo"));cr.appendChild(btn("btn","取消",function(){bkPending=null;bkMode=null;renderBackup()},"bkDoX"));cf.appendChild(cr);bkBody.appendChild(cf)}
    var how=el("details","bk-how");how.appendChild(el("summary",null,"怎么把两个入口的记录合成一份"));var ol=el("ol","bk-steps");
    ["打开以后不常用的那个入口，在这里点「导出备份文件」（或「复制备份文字」）。","打开以后要常用的那个入口，在这里点「从备份文件导入」，选刚才的文件（或粘贴文字）。","看一下列出的内容，点「确认合并」。之后只在常用的入口里记录。"].forEach(function(t){ol.appendChild(el("li",null,t))});
    how.appendChild(ol);bkBody.appendChild(how);}
  window.__setShown=function(){renderBackup();renderTidy()};
  renderBackup();renderTidy();
  try{if(!(window.claude&&window.claude.use)&&navigator.storage&&navigator.storage.persist)navigator.storage.persist().catch(function(){})}catch(e){}
  if(!root.hidden)sched();
  setTimeout(sched,1500);
})();