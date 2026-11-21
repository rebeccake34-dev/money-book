/* 成长等级：从已有记录（主线用时、计划、习惯、运动、记账、每周预算和储蓄）自动算经验值，等级、连击、本月 Boss、奖励商店。
   兑换有价格的奖励会自动记一笔开支，算进每周预算。数据：localStorage game-v1，账号里 data/users/<id>/game。 */
(function(){
  var $=function(id){return document.getElementById(id)};
  function el(t,c,x){var e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e}
  function btn(c,x,f,id){var b=el("button",c,x);b.type="button";if(id)b.id=id;b.onclick=f;return b}
  function toast(m){try{window.__toastAny&&window.__toastAny(m)}catch(e){}}
  function pad(n){return String(n).padStart(2,"0")}
  function ymd(d){return d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate())}
  function parse(k){var p=k.split("-");return new Date(+p[0],+p[1]-1,+p[2],12)}
  function addD(k,n){var d=parse(k);d.setDate(d.getDate()+n);return ymd(d)}
  function wkStart(k){var d=parse(k),w=(d.getDay()+6)%7;d.setDate(d.getDate()-w);return ymd(d)}
  function tkey(){return ymd(new Date())}
  function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,6)}
  function money(n){return "$"+(+n||0).toLocaleString("en-AU",{minimumFractionDigits:0,maximumFractionDigits:2})}
  function go(tab,id){if(typeof showTab==="function")showTab(tab);setTimeout(function(){var e=id&&$(id);if(!e)return;if(e.classList.contains("folded")){var h=e.firstElementChild;if(h)h.click()}e.scrollIntoView({block:"start"})},60)}

  /* ---------- 规则 ---------- */
  var LV=500,TGT={rest:100,work:40};
  var TITLE=["新手","学徒","熟手","达人","高手","大师","宗师","传奇"];
  var WEEK={line:30,budget:50,save:50};
  var DEF_SHOP=[
    {id:"r1",name:"无负罪追剧 1 小时",xp:100,cost:0,cat:"娱乐"},
    {id:"r2",name:"泡澡 / 面膜之夜",xp:150,cost:0,cat:"美容护肤"},
    {id:"r3",name:"一杯奶茶",xp:200,cost:7,cat:"餐饮"},
    {id:"r4",name:"买一本书或文具",xp:300,cost:20,cat:"学习"},
    {id:"r5",name:"看一场电影",xp:400,cost:20,cat:"娱乐"},
    {id:"r6",name:"半日出游",xp:800,cost:30,cat:"娱乐"},
    {id:"r7",name:"新健身装备",xp:1000,cost:80,cat:"购物"}
  ];
  var KEY="game-v1";
  var S={start:null,shop:null,used:[],boss:{},at:0};
  try{var c=JSON.parse(localStorage.getItem(KEY)||"null");if(c)S=Object.assign(S,c)}catch(e){}
  if(!S.start)S.start=wkStart(tkey());
  var ref=null,tm=null,loaded=!(window.claude&&window.claude.use);
  function shop(){return S.shop||DEF_SHOP}
  function save(){memo=null;S.at=Date.now();try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}
    if(!ref)return;clearTimeout(tm);tm=setTimeout(function(){ref.set(JSON.parse(JSON.stringify(S))).catch(function(){toast("成长记录没保存上，稍后再试")})},300)}

  /* ---------- 经验值计算（全部来自已有记录） ---------- */
  function dayXp(k){var parts=[],P=window.__planXp?window.__planXp(k):{min:0,other:0,work:false},L=window.__ledger,C=window.__cut,E=window.__expenses;
    function add(n,v){if(v>0)parts.push([n,v])}
    add("主线",Math.round(P.min));
    add("计划",Math.min(50,P.other*5));
    if(L&&L.ready()){var g=0;L.dayDetail(k).forEach(function(x){if(!x.bad)g+=x.n});add("好习惯",Math.min(60,g*10))}
    if(C){try{var r=C.record(k);if(r){var f=0,tg=C.targets(parse(k));
      if(r.exTotal&&r.exDone>=r.exTotal)f+=50;if(r.cardio)f+=30;if(tg.water&&r.water>=tg.water)f+=10;if(tg.pro&&r.pro>=tg.pro)f+=10;add("运动",f)}}catch(e){}}
    if(E&&E.day(k)>0)add("记账",10);
    if(window.__mood&&window.__mood.get(k))add("心情",5);
    try{var HG=window.__sop&&window.__sop.homeGoal(k);if(HG&&HG.ok)add("在家达标",20)}catch(e){}
    var tot=parts.reduce(function(s,p){return s+p[1]},0);
    return {k:k,xp:tot,parts:parts,work:P.work,target:P.work?TGT.work:TGT.rest}}
  // 一周结束后的结算：主线达标、预算没超、转入储蓄
  function weekBonus(ws){var out=[],A=window.__lines,E=window.__expenses,L=window.__ledger;
    if(A){try{A.status(ws).forEach(function(s){if(!s.pre&&s.light==="g")out.push(["主线「"+s.name+"」达标",WEEK.line])})}catch(e){}}
    if(E){var x=E.week(ws);if(x.totalBudget>0&&!x.over.length&&x.total>0)out.push(["开支没超预算",WEEK.budget])}
    if(L&&L.ready()){var tr=L.transfers()[ws];if(tr>0)out.push(["本周省下的钱转入储蓄",WEEK.save])}
    return out}
  var memo=null;function calc(){if(memo&&Date.now()-memo.at<150)return memo.g;var g=calc0();memo={at:Date.now(),g:g};return g}
  function calc0(){var t=tkey(),days=[],k=S.start,total=0,streak=0,best=0;
    if(k>t)k=t;
    for(;k<=t;k=addD(k,1)){var d=dayXp(k);days.push(d);total+=d.xp;
      var hit=d.xp>=d.target;if(k<t){if(hit){streak++;}else streak=Math.floor(streak/2)}else if(hit)streak++;if(streak>best)best=streak}
    var weeks=[];for(var ws=wkStart(S.start);addD(ws,6)<t;ws=addD(ws,7)){var b=weekBonus(ws);weeks.push({ws:ws,b:b});b.forEach(function(x){total+=x[1]})}
    Object.keys(S.boss||{}).forEach(function(m){var b=S.boss[m];if(b&&b.done)total+=+b.xp||0});
    var spent=S.used.reduce(function(s,u){return s+(+u.xp||0)},0),lv=Math.floor(total/LV)+1;
    return {days:days,today:days[days.length-1],total:total,spent:spent,avail:total-spent,lv:lv,title:TITLE[Math.min(lv-1,TITLE.length-1)],into:total%LV,streak:streak,best:best,weeks:weeks}}
  function weekXp(G,ws){return G.days.filter(function(d){return d.k>=ws&&d.k<=addD(ws,6)}).reduce(function(s,d){return s+d.xp},0)}

  /* ---------- 兑换 ---------- */
  var armed=null,shopOpen=false,folded=false;try{folded=localStorage.getItem("gm-fold")==="1"}catch(e){}
  function redeem(r,G){var E=window.__expenses,t=tkey();if(G.avail<r.xp){toast("经验值还差 "+(r.xp-G.avail));return}
    var u={id:uid(),date:t,rid:r.id,name:r.name,xp:+r.xp,cost:+r.cost||0,exp:null};
    if(u.cost>0&&E)u.exp=E.add(u.cost,r.cat||"娱乐","奖励："+r.name,t,"reward");
    S.used.push(u);armed=null;save();all();
    toast("兑换了「"+r.name+"」，花掉 "+r.xp+" XP"+(u.exp?"，已记一笔开支 "+money(u.cost):""))}
  function unredeem(id){var u=S.used.filter(function(x){return x.id===id})[0];if(!u)return;
    if(u.exp&&window.__expenses)try{window.__expenses.remove(u.exp)}catch(e){}
    S.used=S.used.filter(function(x){return x.id!==id});save();all();toast("已撤销兑换「"+u.name+"」")}
  function mk(k){return (k||tkey()).slice(0,7)}
  function bossOf(m){return (S.boss||{})[m]||null}

  /* ---------- 今天页：成长卡 ---------- */
  var card=el("section","td-card");card.id="td-game";
  function place(){var root=$("todayView");if(!root)return false;if(card.parentNode!==root){var top=$("td-top");root.insertBefore(card,top?top.nextSibling:root.firstChild)}return true}
  function bar(p){var b=el("div","td-bar"),i=el("i");i.style.width=Math.max(0,Math.min(100,p*100))+"%";b.appendChild(i);return b}
  function renderToday(){var root=$("todayView");if(!root||root.hidden||!place())return;var L=window.__ledger;card.textContent="";
    if(!L||!L.ready()||!loaded){var h0=el("div","td-h");h0.appendChild(el("b",null,"成长等级"));h0.appendChild(el("span","td-sub","正在读取记录…"));card.appendChild(h0);return}
    var G=calc(),T=G.today,E=window.__expenses;
    var h=el("div","td-h");h.appendChild(el("b",null,"Lv."+G.lv+" "+G.title));
    h.appendChild(el("span","td-sub",folded?"今天 "+T.xp+"/"+T.target+(T.xp>=T.target?" ✓":"")+" · 连击 "+G.streak+" · 可用 "+G.avail:"累计 "+G.total+" XP · 距 Lv."+(G.lv+1)+" 还差 "+(LV-G.into)));
    if(!folded)h.appendChild(btn("td-more","规则 ›",function(){go("set","secGame")}));
    var fb=btn("td-more gm-fold",folded?"展开 ▾":"收起 ▴",function(){folded=!folded;try{localStorage.setItem("gm-fold",folded?"1":"0")}catch(e){}if(folded){shopOpen=false;armed=null}renderToday()},"gmFold");
    fb.setAttribute("aria-expanded",String(!folded));h.appendChild(fb);card.appendChild(h);card.appendChild(bar(G.into/LV));
    card.classList.toggle("gm-folded",folded);if(folded)return;
    var r=el("div","gm-today"),v=el("div","gm-v");
    v.appendChild(el("b",null,"今天 "+T.xp+" / "+T.target+" XP"+(T.xp>=T.target?" ✓":"")));
    v.appendChild(el("span","td-note",(T.work?"上班日目标":"休息日目标")+(T.parts.length?" · "+T.parts.map(function(p){return p[0]+" "+p[1]}).join(" · "):" · 打卡、计划打勾、记账都会自动加分")));
    v.appendChild(bar(T.xp/T.target));r.appendChild(v);
    var sk=el("div","gm-streak");sk.appendChild(el("b",null,String(G.streak)));sk.appendChild(el("small",null,"连击天数"));r.appendChild(sk);card.appendChild(r);
    // 本月 Boss
    var m=mk(),B=bossOf(m),br=el("div","td-row gm-boss");
    if(B&&B.name){br.appendChild(el("span","td-k","本月 Boss"));br.appendChild(el("span","td-v",B.name+" · +"+B.xp+" XP"));
      br.appendChild(B.done?btn("td-btn ghost td-keep","已通关 ✓ 撤销",function(){B.done=false;B.at=null;save();all()},"gmBossU"):btn("td-btn td-keep","通关",function(){B.done=true;B.at=Date.now();save();all();toast("Boss 通关！+"+B.xp+" XP")},"gmBoss"))}
    else{br.appendChild(el("span","td-k","本月 Boss"));br.appendChild(el("span","td-v td-note","还没设定"));br.appendChild(btn("td-btn","设定 ›",function(){go("set","secGame")},"gmBossSet"))}
    card.appendChild(br);
    // 奖励商店
    var sh=el("div","td-row");sh.appendChild(el("span","td-k","可用"));sh.appendChild(el("span","td-v",G.avail+" XP"+(G.spent?"（已兑换 "+G.spent+"）":"")));
    sh.appendChild(btn("td-btn td-keep",shopOpen?"收起商店":"奖励商店",function(){shopOpen=!shopOpen;armed=null;renderToday()},"gmShop"));card.appendChild(sh);
    if(shopOpen){var W=E?E.week():null,ls=el("div","gm-shop");
      shop().forEach(function(it){var row=el("div","gm-item"),tx=el("div","gm-it");tx.appendChild(el("span",null,it.name));
        tx.appendChild(el("small",null,it.xp+" XP"+(it.cost?" · "+money(it.cost)+" 记进「"+(it.cat||"娱乐")+"」":"")));row.appendChild(tx);
        var lack=G.avail<it.xp,over=!lack&&it.cost>0&&W&&W.totalBudget>0&&W.left<it.cost,lbl=lack?"还差 "+(it.xp-G.avail):armed===it.id?"确认兑换":over?"超本周预算":"兑换";
        var b=btn("td-btn td-keep"+(over&&armed!==it.id?" gm-warn":""),lbl,function(){if(over&&armed!==it.id){armed=it.id;renderToday();toast("本周预算只剩 "+money(W.left)+"，再点一次确认");return}redeem(it,G)},"gmR-"+it.id);
        b.disabled=lack;row.appendChild(b);ls.appendChild(row)});
      card.appendChild(ls);
      var last=S.used.slice().reverse()[0];
      if(last){var lr=el("div","td-row");lr.appendChild(el("span","td-v td-note","最近兑换："+last.name+"（"+(parse(last.date).getMonth()+1)+"/"+parse(last.date).getDate()+"）"));
        if(last.date===tkey())lr.appendChild(btn("td-btn ghost td-keep","撤销",function(){unredeem(last.id)},"gmRU"));card.appendChild(lr)}}
  }

  /* ---------- 每周回顾：XP 和结算 ---------- */
  function renderWeek(){var box=$("gameWeek"),L=window.__ledger;if(!box)return;box.textContent="";if(!L||!L.ready())return;
    var G=calc(),ws=wkStart(tkey()),pw=addD(ws,-7);
    box.appendChild(el("h3",null,"成长经验值"));
    var u=el("ul","td-list");
    u.appendChild(el("li",null,"本周 "+weekXp(G,ws)+" XP"+(pw>=wkStart(S.start)?"，上周 "+weekXp(G,pw)+" XP":"")+"；连击 "+G.streak+" 天，最长 "+G.best+" 天"));
    var lw=G.weeks.filter(function(w){return w.ws===pw})[0];
    if(lw){if(lw.b.length)lw.b.forEach(function(x){u.appendChild(el("li","good","上周结算："+x[0]+" +"+x[1]))});else u.appendChild(el("li",null,"上周结算没有拿到奖励"))}
    box.appendChild(u);
    box.appendChild(el("p","note","每周一结算上周：每条主线达标（绿灯）+"+WEEK.line+"，有预算的开支都没超 +"+WEEK.budget+"，本周省下的钱转入储蓄 +"+WEEK.save+"。"));
  }

  /* ---------- 设置页：规则、奖励、Boss ---------- */
  function renderSet(){var box=$("gmSetBody");if(!box)return;var a=document.activeElement;if(a&&box.contains(a)&&a.tagName!=="BUTTON")return;box.textContent="";
    var rl=el("ul","td-list");
    ["主线用时：每分钟 1 XP（计划里归到主线并打勾，或今天页「+30分」；同一次活动只算一遍，两边都记了会提示合并）","其他计划打勾：每项 5 XP，每天最多 50","好习惯打卡：每次 10 XP，每天最多 60（坏习惯不扣经验，只在账本里扣钱）",
     "运动：力量动作全部完成 50，有氧 30，喝水达标 10，蛋白质达标 10","记账：当天记过开支 10；记下今天心情 5",
     "每日目标：上班日（计划里有带时间的上班）"+TGT.work+"，休息日 "+TGT.rest+"；达标连击 +1，没达标连击减半，不清零",
     "每 "+LV+" XP 升一级；每周一结算上周的主线、预算和储蓄奖励（见「回顾」）"].forEach(function(t){rl.appendChild(el("li",null,t))});
    box.appendChild(rl);
    box.appendChild(el("p","note","从 "+(parse(S.start).getMonth()+1)+"月"+parse(S.start).getDate()+"日 开始计分。经验值都从已有记录自动算，不用另外打卡。"));
    // 奖励
    box.appendChild(el("b",null,"奖励商店"));
    var list=JSON.parse(JSON.stringify(shop())),cats=window.__expenses?window.__expenses.cats():["娱乐"];
    function put(){S.shop=list;save();all()}
    var ls=el("div","gm-set");
    list.forEach(function(it,i){var r=el("div","gm-srow");
      var n=el("input");n.type="text";n.maxLength=30;n.value=it.name;n.id="gmN-"+it.id;n.setAttribute("aria-label","奖励名称");n.onchange=function(){var x=n.value.trim();if(!x){n.value=it.name;return}it.name=x;put()};
      var xw=el("label","ln-h"),x=el("input");x.type="number";x.min="10";x.step="10";x.inputMode="numeric";x.value=it.xp;x.id="gmX-"+it.id;x.setAttribute("aria-label","需要的经验值");
      x.onchange=function(){it.xp=Math.max(10,Math.round(+x.value||0));x.value=it.xp;put()};xw.appendChild(x);xw.appendChild(el("span",null,"XP"));
      var cw=el("label","ln-h"),cc=el("input");cc.type="number";cc.min="0";cc.step="1";cc.inputMode="decimal";cc.value=it.cost||0;cc.id="gmC-"+it.id;cc.setAttribute("aria-label","花费金额");
      cc.onchange=function(){it.cost=Math.max(0,Math.round((+cc.value||0)*100)/100);cc.value=it.cost;put()};cw.appendChild(el("span",null,"$"));cw.appendChild(cc);
      var s=el("select");s.id="gmK-"+it.id;s.setAttribute("aria-label","记进哪类开支");cats.forEach(function(c){var o=el("option",null,c);o.value=c;s.appendChild(o)});s.value=it.cat||"娱乐";s.onchange=function(){it.cat=s.value;put()};
      var del=btn("pl-del","✕",function(){if(del.dataset.arm){list.splice(i,1);put();renderSet()}else{del.dataset.arm="1";del.textContent="确认删除";setTimeout(function(){if(del.isConnected){delete del.dataset.arm;del.textContent="✕"}},3000)}});
      del.setAttribute("aria-label","删除奖励 "+it.name);
      [n,xw,cw,s,del].forEach(function(e){r.appendChild(e)});ls.appendChild(r)});
    box.appendChild(ls);
    var ar=el("div","bk-row");ar.appendChild(btn("btn","＋ 添加奖励",function(){list.push({id:"r"+uid(),name:"新奖励",xp:300,cost:0,cat:"娱乐"});put();renderSet()},"gmAdd"));
    ar.appendChild(el("span","note","金额填 0 就不记开支；有金额的兑换时自动记一笔，算进每周预算。"));box.appendChild(ar);
    // Boss
    box.appendChild(el("b",null,"每月 Boss（一个月一个大挑战）"));
    var now=new Date(),ms=[mk(),ymd(new Date(now.getFullYear(),now.getMonth()+1,1)).slice(0,7)];
    ms.forEach(function(m){var B=bossOf(m)||{name:"",xp:200,done:false},r=el("div","gm-brow");
      r.appendChild(el("span","gm-mon",(+m.slice(5))+"月"));
      var n=el("input");n.type="text";n.maxLength=40;n.value=B.name;n.placeholder="例如：完成一次完整模拟考";n.id="gmBN-"+m;n.setAttribute("aria-label",(+m.slice(5))+"月 Boss");
      var xw=el("label","ln-h"),x=el("input");x.type="number";x.min="50";x.step="50";x.inputMode="numeric";x.value=B.xp;x.id="gmBX-"+m;x.setAttribute("aria-label","通关奖励经验值");xw.appendChild(x);xw.appendChild(el("span",null,"XP"));
      function sv(){var nm=n.value.trim();S.boss=S.boss||{};if(!nm){delete S.boss[m]}else S.boss[m]={name:nm,xp:Math.max(50,Math.round(+x.value||200)),done:!!(bossOf(m)||{}).done,at:(bossOf(m)||{}).at||null};save();all()}
      n.onchange=sv;x.onchange=sv;[n,xw].forEach(function(e){r.appendChild(e)});if(B.done)r.appendChild(el("span","gm-done","已通关"));box.appendChild(r)});
  }

  var timer=null;function all(){memo=null;clearTimeout(timer);timer=setTimeout(function(){try{renderToday()}catch(e){try{window.__debugPush&&window.__debugPush("game",e)}catch(x){}}try{renderWeek()}catch(e){}try{if(!$("setView").hidden)renderSet()}catch(e){}},80)}
  window.__gameRender=all;
  window.__game={calc:calc,day:dayXp};
  ["__todayRender","__todayShown","__overview","__cutRendered"].forEach(function(n){var f=window[n];window[n]=function(){var r;try{r=f&&f.apply(this,arguments)}finally{all()}return r}});
  var fs=window.__setShown;window.__setShown=function(){var r;try{r=fs&&fs.apply(this,arguments)}finally{try{renderSet()}catch(e){}}return r};
  window.__bk=window.__bk||{};
  window.__bk.game={dump:function(){return JSON.parse(JSON.stringify(S))},
    merge:function(d){if(!d)return 0;var n=0,ids={};S.used.forEach(function(u){ids[u.id]=1});
      (d.used||[]).forEach(function(u){if(u&&u.id&&!ids[u.id]){S.used.push(u);ids[u.id]=1;n++}});
      if(d.start&&d.start<S.start){S.start=d.start;n++}
      if(!S.shop&&d.shop){S.shop=d.shop;n++}
      Object.keys(d.boss||{}).forEach(function(m){if(!/^\d{4}-\d\d$/.test(m))return;var a=(S.boss||{})[m],b=d.boss[m];if(!b)return;if(!a||(!a.done&&b.done)){S.boss=S.boss||{};S.boss[m]=b;n++}});
      if(n)save();all();return n}};
  all();
  if(!(window.claude&&window.claude.use))return;
  Promise.all([window.claude.use("db"),window.claude.use("user")]).then(function(r){var db=r[0],user=r[1];if(!db||!user){loaded=true;all();return}
    return user.id().then(function(id){if(!id){loaded=true;all();return}ref=db.doc("data/users/"+id+"/game");var first=true;
      ref.onSnapshot(function(s){if(s.metadata.hasPendingWrites)return;
        if(!s.exists){if(first&&!s.metadata.fromCache){first=false;loaded=true;save();all()}return}
        first=false;loaded=true;var b=JSON.parse(JSON.stringify(s.data()));S=Object.assign({start:null,shop:null,used:[],boss:{},at:0},b);if(!S.start)S.start=wkStart(tkey());
        try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}all()},function(){ref=null;loaded=true;all()});
    });
  }).catch(function(){loaded=true;all()});
  setTimeout(function(){if(!loaded){loaded=true;all()}},8000);
})();
