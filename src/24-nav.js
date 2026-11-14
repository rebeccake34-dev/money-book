(function(){
  var $=function(id){return document.getElementById(id)};
  var TITLES={today:["今天",""],set:["设置","备份、主题颜色、添加习惯、算法说明"],ledger:["好习惯省钱账本",""],cut:["运动打卡","训练 · 饮食 · 喝水 · 身体变化，每天打卡"],plan:["日常计划","每天的安排、备忘提醒，一直排到 2027 年底"],cycle:["生理期","记录经期和身体感受，预测下次，按周期调整训练和安排"]};
  var TOC={
    ledger:[["本周省钱","secLedger"],["储蓄","savSec"],["日常开支","expSec"],["工资排班","paySec"],["习惯打卡","groups"],["回顾","secWeek"],["累计","secMs"],["便签","secNotes"],["价格清单","secAes"]],
    today:[],
    set:[["数据备份","secBackup"],["主题颜色","secTheme"],["添加习惯","secAdd"],["整理习惯","secTidy"],["算法说明","secRules"]],
    cut:[["今日汇总","cutSum"],["今日训练","cutTrain"],["饮食","cutFood"],["喝水","cutWater"],["有氧","cutCardio"],["身体变化","cutBody"],["调整建议","cutAdvice"],["健身日历","cutCal"],["我的目标","goalBox"]],
    plan:[["备忘录","plMemo"],["月历","plCalSec"],["年历 2027","@year"],["今天的安排","@today"]],
    cycle:[["今天","cyToday"],["每天记录","cyLog"],["建议与同步","cyAdvice"],["周期日历","cyCal"],["历史统计","cyHist"],["设置","cySet"]]
  };
  var FOLD={savSec:0,expSec:0,paySec:0,secWeek:1,secMs:1,secNotes:0,secAes:1,secAdd:0,secTheme:0,
    cutTrain:0,cutFood:0,cutWater:0,cutCardio:1,cutBody:1,cutAdvice:1,cutCal:0,plMemo:0,cyLog:0,cyAdvice:0,cyCal:0,cyHist:0,cySet:1};
  var st={};try{st=JSON.parse(localStorage.getItem("fold-state")||"{}")||{}}catch(e){}
  function saveSt(){try{localStorage.setItem("fold-state",JSON.stringify(st))}catch(e){}}
  function isF(id){return id in st?!!st[id]:!!FOLD[id]}
  Object.keys(FOLD).forEach(function(id){var e=$(id);if(!e)return;e.classList.add("fold");e.classList.toggle("folded",isF(id));});
  function setF(id,v){var e=$(id);if(!e)return;st[id]=v?1:0;saveSt();e.classList.toggle("folded",v);syncHead(e);if(id==="cutTrain")try{trainSum()}catch(x){}}
  function syncHead(e){var h=e.firstElementChild;if(h){h.setAttribute("aria-expanded",String(!e.classList.contains("folded")));}}
  document.addEventListener("click",function(ev){
    var t=ev.target;if(!t.closest)return;
    if(t.closest("input,select,textarea,label,a,button:not(.fold-head-btn)"))return;
    var sec=t.closest(".fold");if(!sec)return;var h=sec.firstElementChild;if(!h||!h.contains(t))return;
    setF(sec.id,!sec.classList.contains("folded"));
  });
  // keyboard: make heads focusable
  function prepHeads(){Object.keys(FOLD).forEach(function(id){var e=$(id);if(!e)return;var h=e.firstElementChild;if(!h||h.dataset.fh)return;h.dataset.fh="1";h.tabIndex=0;h.setAttribute("role","button");syncHead(e);
    h.addEventListener("keydown",function(ev){if(ev.target!==h)return;if(ev.key==="Enter"||ev.key===" "){ev.preventDefault();setF(id,!e.classList.contains("folded"));}});});}
  prepHeads();
  // dynamic sections rebuild their head: re-prep after changes
  var mo=new MutationObserver(function(){prepHeads();});
  ["savSec","expSec","paySec","plMemo"].forEach(function(id){var e=$(id);if(e)mo.observe(e,{childList:true});});

  var cur="ledger";
  function tabNow(){return $("tabToday").getAttribute("aria-selected")==="true"?"today":$("tabSet").getAttribute("aria-selected")==="true"?"set":$("tabCut").getAttribute("aria-selected")==="true"?"cut":$("tabPlan").getAttribute("aria-selected")==="true"?"plan":$("tabCycle").getAttribute("aria-selected")==="true"?"cycle":"ledger";}
  function anyOpen(){return TOC[cur].some(function(x){return x[1] in FOLD&&!$(x[1]).classList.contains("folded")});}
  function buildToc(){
    var nav=$("toc");nav.textContent="";nav.hidden=!TOC[cur].length;if(nav.hidden)return;
    TOC[cur].forEach(function(x){var b=document.createElement("button");b.type="button";b.textContent=x[0];b.onclick=function(){go(x[1])};nav.appendChild(b);});
    if(cur!=="plan"&&cur!=="set"){var a=document.createElement("button");a.type="button";a.className="toc-all";var o=anyOpen();a.textContent=o?"全部收起":"全部展开";
      a.onclick=function(){var v=anyOpen();TOC[cur].forEach(function(x){if(x[1] in FOLD)setF(x[1],v)});buildToc();};nav.appendChild(a);}
    nav.scrollLeft=0;
  }
  var rm=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;
  function scrollTo(e){if(e)e.scrollIntoView({behavior:rm?"auto":"smooth",block:"start"});}
  function todayKey(){var d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");}
  function go(id){
    if(id==="@year"){$("plViewYear").click();setTimeout(function(){scrollTo($("plYear"))},60);return;}
    if(id==="@today"){if(window.__planSelect)window.__planSelect(todayKey());setTimeout(function(){var p=$("plPanel");if(p&&matchMedia("(min-width:901px)").matches)scrollTo(p);},80);return;}
    if(id==="plCalSec"&&$("plViewMonth").getAttribute("aria-pressed")!=="true")$("plViewMonth").click();
    var e=$(id);if(!e)return;
    if(id in FOLD&&e.classList.contains("folded"))setF(id,false);
    if(e.tagName==="DETAILS")e.open=true;
    scrollTo(e);
  }
  function applyTab(t){
    cur=t;var T=TITLES[t];
    document.querySelector("header h1").textContent=T[0];
    document.title=T[0];
    var sub=T[1];if(t==="today"){var dn=new Date();sub=(dn.getMonth()+1)+"月"+dn.getDate()+"日 "+["周日","周一","周二","周三","周四","周五","周六"][dn.getDay()]+" · 一页记完今天"}
    $("hSub").textContent=sub;$("hSub").hidden=!sub;
    $("hIntro").hidden=t!=="ledger";$("hCur").hidden=t!=="ledger";
    var ch=document.querySelector(".cut-head h1");if(ch)ch.hidden=true;
    var ph=document.querySelector(".pl-top h2");if(ph)ph.hidden=true;
    buildToc();fab();try{trainSum()}catch(x){}
  }
  var orig=window.showTab;
  if(typeof orig==="function"){window.showTab=function(n){orig(n);applyTab(TOC[n]?n:"ledger");};}
  ["tabToday","tabLedger","tabCut","tabPlan","tabCycle","tabSet"].forEach(function(id){$(id).addEventListener("click",function(){setTimeout(function(){applyTab(tabNow())},0)});});

  // training summary when folded
  function trainSum(){var s=$("planSel"),o=s&&s.options[s.selectedIndex];var nm=o?o.textContent.replace(/^周.：/,"").replace(/（.*）$/,""):"";
    var done=$("sTrain")?$("sTrain").textContent:"";$("trainSum").textContent=nm+(done&&done!=="0/0"?" · 完成 "+done:"");}
  var cr=window.__cutRendered;window.__cutRendered=function(){try{trainSum()}catch(e){}if(cr)return cr.apply(this,arguments)};
  try{trainSum()}catch(e){}

  // floating "回到今天" on the plan tab
  var fb=$("todayFab");
  function fab(){
    if(cur!=="plan"){fb.hidden=true;return;}
    var c=document.querySelector('#plCal [data-k="'+todayKey()+'"]');
    var yearMode=$("plViewYear").getAttribute("aria-pressed")==="true";
    var vis=false;if(c&&!yearMode){var r=c.getBoundingClientRect();vis=r.bottom>60&&r.top<innerHeight-60;}
    var sheet=$("plPanel")&&$("plPanel").classList.contains("pl-open")&&!matchMedia("(min-width:901px)").matches;
    fb.hidden=vis||sheet;
  }
  fb.onclick=function(){$("plGoToday").click();setTimeout(fab,600);};
  window.addEventListener("scroll",fab,{passive:true});window.addEventListener("resize",fab);
  document.addEventListener("click",function(){setTimeout(fab,50)},true);
  new MutationObserver(function(){setTimeout(fab,30)}).observe($("plCal"),{childList:true});
  new MutationObserver(function(){setTimeout(fab,30)}).observe($("plPanel"),{attributes:true,attributeFilter:["class"]});
  // keep what you tapped in the same place on screen (re-rendering used to make the page jump)
  function keyOf(el){var e=el;while(e&&e!==document.body){
      if(e.id&&!/^(groups|plPanel|plMemo|exList|calDay|week|plCal|cut|plan|ledgerView)$/.test(e.id))return "#"+CSS.escape(e.id);
      var ds=e.dataset||{};for(var k of ["h","k","id","i","xdone","q"])if(ds[k]!=null)return "["+"data-"+k+'="'+CSS.escape(ds[k])+'"]'+(e.tagName?"":"");
      e=e.parentElement;}return null;}
  function scroller(el){var e=el&&el.parentElement;while(e&&e!==document.body){var cs=getComputedStyle(e);if(/(auto|scroll)/.test(cs.overflowY)&&e.scrollHeight>e.clientHeight+1)return e;e=e.parentElement;}return null;}
  document.addEventListener("click",function(ev){
    var t=ev.target;if(!t.closest)return;
    var hit=t.closest('input[type=checkbox],.tile,.pl-item,.cd-it,.ov-row,.td-keep');if(!hit||hit.closest(".toc"))return;
    var key=keyOf(t.matches("input")?t:hit);if(!key)return;
    var old=document.querySelector(key);if(!old)return;
    var top0=old.getBoundingClientRect().top,sc=scroller(old),st0=sc?sc.scrollTop:null,y0=window.scrollY,until=Date.now()+900;
    function fix(){var el=document.querySelector(key);if(!el||!el.isConnected)return;
      var s2=scroller(el);if(sc&&s2===sc&&st0!=null&&sc.scrollTop!==st0)sc.scrollTop=st0;
      var d=el.getBoundingClientRect().top-top0;if(Math.abs(d)>1){if(s2&&s2===sc)s2.scrollTop+=d;else window.scrollBy(0,d);}}
    if(hit.classList.contains("ov-row"))return;
    [0,40,120,300,600].forEach(function(ms){setTimeout(function(){if(Date.now()<=until)fix()},ms)});
    requestAnimationFrame(fix);
  },true);
  // phone: tap the dimmed area above the day sheet, or the blank top of the sheet, to close it
  var pp=$("plPanel"),shade=$("plShade");
  function phone(){return !matchMedia("(min-width:901px)").matches}
  function shadeUpd(){shade.hidden=!(pp.classList.contains("pl-open")&&phone()&&cur==="plan");}
  function closeSheet(){pp.classList.remove("pl-open");}
  shade.addEventListener("click",closeSheet);
  pp.addEventListener("click",function(ev){if(!phone()||!pp.classList.contains("pl-open"))return;
    var t=ev.target;if(t.closest("button,input,select,textarea,label,a"))return;
    var r=pp.getBoundingClientRect();if(ev.clientY-r.top<22||t.closest(".pl-ph"))closeSheet();});
  new MutationObserver(shadeUpd).observe(pp,{attributes:true,attributeFilter:["class"]});
  window.addEventListener("resize",shadeUpd);
  ["tabToday","tabLedger","tabCut","tabPlan","tabCycle","tabSet"].forEach(function(id){$(id).addEventListener("click",function(){setTimeout(shadeUpd,0)})});
  applyTab(tabNow());shadeUpd();
  setTimeout(fab,800);
})();