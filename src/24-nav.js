(function(){
  var $=function(id){return document.getElementById(id)};
  var TITLES={today:["今天",""],set:["设置","主线、奖励、板块、备份、主题颜色、习惯"],ledger:["好习惯省钱账本",""],cut:["运动打卡","训练 · 饮食 · 喝水 · 身体变化，每天打卡"],plan:["日常计划","每天的安排、备忘提醒，一直排到 2027 年底"],cycle:["生理期","记录经期和身体感受，预测下次，按周期调整训练和安排"]};
  var TOC={
    ledger:[["本周省钱","secLedger"],["储蓄","savSec"],["日常开支","expSec"],["工资排班","paySec"],["习惯打卡","groups"],["回顾","secWeek"],["累计","secMs"],["便签","secNotes"],["价格清单","secAes"]],
    today:[],
    set:[["生活主线","secLines"],["成长奖励","secGame"],["板块管理","secBlocks"],["添加习惯","secAdd"],["主题颜色","secTheme"],["数据备份","secBackup"],["整理习惯","secTidy"],["算法说明","secRules"]],
    cut:[["今日汇总","cutSum"],["今日训练","cutTrain"],["有氧与消耗","cutCardio"],["饮食","cutFood"],["喝水","cutWater"],["健身日历","cutCal"],["身体变化","cutBody"],["调整建议","cutAdvice"],["我的目标","goalBox"]],
    plan:[["备忘录","plMemo"],["月历","plCalSec"],["年历 2027","@year"],["今天的安排","@today"]],
    cycle:[["今天","cyToday"],["每天记录","cyLog"],["建议与同步","cyAdvice"],["周期日历","cyCal"],["历史统计","cyHist"],["设置","cySet"]]
  };
  var FOLD={savSec:0,expSec:0,paySec:0,secWeek:1,secMs:1,secNotes:0,secAes:1,secAdd:1,secTheme:1,secLines:0,secGame:1,secBlocks:1,secBackup:1,secTidy:1,secRules:1,
    cutTrain:0,cutFood:0,cutWater:0,cutCardio:1,cutBody:1,cutAdvice:1,cutCal:0,plMemo:0,cyLog:0,cyAdvice:0,cyCal:0,cyHist:0,cySet:1};
  var st={};try{st=JSON.parse(localStorage.getItem("fold-state")||"{}")||{}}catch(e){}
  function saveSt(){try{localStorage.setItem("fold-state",JSON.stringify(st))}catch(e){}}
  function isF(id){return id in st?!!st[id]:!!FOLD[id]}
  // ---- 运动、设置页的板块顺序：默认把常用的放前面，也可以自己调（存在这台设备上） ----
  var ORD_DEF={cut:TOC.cut.map(function(x){return x[1]}),set:TOC.set.map(function(x){return x[1]})},NAMES={},ordOpen=false,ANCH={};
  Object.keys(ORD_DEF).forEach(function(t){TOC[t].forEach(function(x){NAMES[x[1]]=x[0]})});
  var ord={};try{ord=JSON.parse(localStorage.getItem("sec-order-v1")||"{}")||{}}catch(e){}
  function ordOf(t){var d=ORD_DEF[t],o=(ord[t]||[]).filter(function(id){return d.indexOf(id)>=0});d.forEach(function(id){if(o.indexOf(id)<0)o.push(id)});return o}
  function applyOrd(t){var ids=ordOf(t),els=ids.map(function(id){return $(id)}).filter(Boolean);if(!els.length)return;var par=els[0].parentNode;
    if(!(t in ANCH)){var last=els.reduce(function(a,b){return a.compareDocumentPosition(b)&Node.DOCUMENT_POSITION_FOLLOWING?b:a});ANCH[t]=last.nextSibling;if(ANCH[t]&&ANCH[t].nodeType!==1)ANCH[t]=last.nextElementSibling}
    els.forEach(function(e){if(e.parentNode!==par)return;par.insertBefore(e,ANCH[t]||null);if(e.id==="cutTrain"){var pe=$("planEditor");if(pe)par.insertBefore(pe,ANCH[t]||null)}});
    TOC[t]=ids.map(function(id){return [NAMES[id],id]})}
  function saveOrd(t,o){ord[t]=o;try{localStorage.setItem("sec-order-v1",JSON.stringify(ord))}catch(e){}applyOrd(t)}
  Object.keys(ORD_DEF).forEach(applyOrd);
  // ---- 板块管理：不需要的板块或页面可以隐藏，在「设置 › 板块管理」找回（存在这台设备上） ----
  var BLK=[["tabs","页面",[["运动打卡","tabCut"],["日常计划","tabPlan"],["生理期","tabCycle"]]],
    ["today","今天页",[["本周主攻","td-focus"],["成长等级","td-game"],["生活主线","td-lines"],["今天心情","td-mood"],["习惯打卡","td-hab"],["运动","td-fit"],["饮食","td-food"],["开支","td-exp"],["今天的计划","td-plan"],["生理期","td-cyc"],["本周小结","td-week"],["储蓄","td-sav"]]],
    ["ledger","省钱账本",TOC.ledger.filter(function(x){return x[1]!=="secLedger"})],["cut","运动打卡",TOC.cut],["set","设置",TOC.set.filter(function(x){return x[1]!=="secBlocks"})]];
  var LINK={tabCut:["td-fit","td-food"],tabPlan:["td-plan"],tabCycle:["td-cyc"]},TABV={tabCut:"cut",tabPlan:"plan",tabCycle:"cycle"};
  var HID={};try{(JSON.parse(localStorage.getItem("hidden-blocks-v1")||"[]")||[]).forEach(function(id){HID[id]=1})}catch(e){}
  function isHid(id){if(HID[id])return true;for(var t in LINK)if(HID[t]&&LINK[t].indexOf(id)>=0)return true;return false}
  var hst=document.createElement("style");hst.id="hideStyle";document.head.appendChild(hst);
  function applyHid(){var ids=[];BLK.forEach(function(g){g[2].forEach(function(x){if(isHid(x[1]))ids.push("#"+x[1])})});
    hst.textContent=ids.length?ids.join(",")+"{display:none!important}":"";
    for(var t in TABV)if(HID[t]&&typeof cur!=="undefined"&&cur===TABV[t]&&typeof showTab==="function")showTab("today")}
  function setHid(id,v){if(v)HID[id]=1;else delete HID[id];try{localStorage.setItem("hidden-blocks-v1",JSON.stringify(Object.keys(HID)))}catch(e){}applyHid();buildToc();renderBlocks()}
  function nameOf(id){var n=id;BLK.forEach(function(g){g[2].forEach(function(x){if(x[1]===id)n=x[0]})});return n}
  function renderBlocks(){var box=$("blkBody");if(!box)return;box.textContent="";
    function e(t,c,x){var d=document.createElement(t);if(c)d.className=c;if(x!=null)d.textContent=x;return d}
    var n=Object.keys(HID).length;
    box.appendChild(e("p","note","取消勾选就会隐藏，记录不会删除，随时可以在这里勾回来。也可以在各页目录栏点「管理板块」快速隐藏或调整顺序。"+(n?" 现在隐藏了 "+n+" 个。":"")));
    BLK.forEach(function(g){var f=e("fieldset","blk-g");f.appendChild(e("legend",null,g[1]));var w=e("div","blk-list");
      g[2].forEach(function(x){var l=e("label","blk-it"),c=e("input");c.type="checkbox";c.id="blk-"+x[1];c.checked=!HID[x[1]];c.onchange=function(){setHid(x[1],!c.checked)};
        l.appendChild(c);l.appendChild(e("span",null,x[0]));w.appendChild(l)});f.appendChild(w);box.appendChild(f)});
    var mf=e("fieldset","blk-g");mf.appendChild(e("legend",null,"今天页常用（打勾的放在上面，其余收进「更多」）"));var mw=e("div","blk-list");
    TD_ALL.forEach(function(id){var l=e("label","blk-it"),c=e("input");c.type="checkbox";c.id="blkMain-"+id;c.checked=MAIN.indexOf(id)>=0;c.onchange=function(){setMain(id,c.checked)};l.appendChild(c);l.appendChild(e("span",null,nameOf(id)));mw.appendChild(l)});
    mf.appendChild(mw);var rb=e("button","btn ghost","恢复默认常用");rb.type="button";rb.id="blkMainReset";rb.onclick=function(){MAIN=MAIN_DEF.slice();try{localStorage.setItem("td-main-v1",JSON.stringify(MAIN))}catch(x){}applyMain();renderBlocks()};mf.appendChild(rb);box.appendChild(mf);
    if(n){var b=e("button","btn","全部显示");b.type="button";b.id="blkAll";b.onclick=function(){HID={};setHid("_",false)};box.appendChild(b)}}
  // ---- 今天页精简：常用的几张卡放上面，其余收进「更多」（存在这台设备上，可在板块管理里改） ----
  var MAIN_DEF=["td-focus","td-lines","td-plan","td-hab","td-fit"],TD_ALL=BLK.filter(function(g){return g[0]==="today"})[0][2].map(function(x){return x[1]});
  var MAIN=null;try{MAIN=JSON.parse(localStorage.getItem("td-main-v1")||"null")}catch(e){}if(!Array.isArray(MAIN))MAIN=MAIN_DEF.slice();
  var moreOpen=false;try{moreOpen=localStorage.getItem("td-more-open")==="1"}catch(e){}
  var tst=document.createElement("style");tst.id="tdMainStyle";document.head.appendChild(tst);
  var mbar=document.createElement("div");mbar.className="td-morebar";mbar.id="tdMoreBar";var mbtn=document.createElement("button");mbtn.type="button";mbtn.className="td-btn ghost td-keep";mbtn.id="tdMoreBtn";mbar.appendChild(mbtn);
  mbtn.onclick=function(){moreOpen=!moreOpen;try{localStorage.setItem("td-more-open",moreOpen?"1":"0")}catch(e){}applyMain()};
  function applyMain(){var tv=$("todayView");if(!tv)return;if(mbar.parentNode!==tv)tv.appendChild(mbar);
    var main=TD_ALL.filter(function(id){return MAIN.indexOf(id)>=0}).sort(function(a,b){return MAIN.indexOf(a)-MAIN.indexOf(b)}),rest=TD_ALL.filter(function(id){return MAIN.indexOf(id)<0&&!isHid(id)});
    var css="#todayView>*{order:60}#td-warn,#td-top{order:0}#tdMoreBar{order:50}#todayView>.td-foot{order:99}";
    main.forEach(function(id,i){css+="#"+id+"{order:"+(i+1)+"}"});
    if(rest.length&&!moreOpen)css+=rest.map(function(id){return "#"+id}).join(",")+"{display:none!important}";
    tst.textContent=css;mbar.hidden=!rest.length;
    mbtn.textContent=moreOpen?"收起更多 ▴":"更多（"+rest.length+"）▾";mbtn.title=rest.map(function(id){return nameOf(id)}).join("、");mbtn.setAttribute("aria-expanded",String(moreOpen))}
  function setMain(id,v){MAIN=MAIN.filter(function(x){return x!==id});if(v)MAIN.push(id);try{localStorage.setItem("td-main-v1",JSON.stringify(MAIN))}catch(e){}applyMain();renderBlocks()}
  applyMain();
  {var ah=applyHid;applyHid=function(){ah.apply(this,arguments);try{applyMain()}catch(e){}}}
  window.__blocksShown=renderBlocks;
  {var fs=window.__setShown;window.__setShown=function(){var r;try{r=fs&&fs.apply(this,arguments)}finally{try{renderBlocks()}catch(x){}}return r}}
  {var tv=$("todayView");if(tv){var tf=document.createElement("div");tf.className="td-foot";var tb=document.createElement("button");tb.type="button";tb.className="td-more";tb.id="tdBlocks";tb.textContent="管理首页板块 ›";
    tb.onclick=function(){if(typeof showTab==="function")showTab("set");setTimeout(function(){go("secBlocks")},60)};tf.appendChild(tb);tv.appendChild(tf)}}
  function ordPanel(){var p=$("ordPanel");if(!p){p=document.createElement("div");p.id="ordPanel";p.className="ord-panel";var nav=$("toc");nav.parentNode.insertBefore(p,nav.nextSibling)}
    var canOrd=!!ORD_DEF[cur],grp=BLK.filter(function(g){return g[0]===cur})[0];
    p.textContent="";p.hidden=!(ordOpen&&grp);if(p.hidden)return;
    var o=canOrd?ordOf(cur):grp[2].map(function(x){return x[1]}),h=document.createElement("div");h.className="ord-h";var b=document.createElement("b");b.textContent=canOrd?"板块顺序和显示":"显示哪些板块";h.appendChild(b);
    function mk(txt,cls,f,id,lbl){var x=document.createElement("button");x.type="button";x.className=cls;x.textContent=txt;x.onclick=f;if(id)x.id=id;if(lbl)x.setAttribute("aria-label",lbl);return x}
    if(canOrd)h.appendChild(mk("恢复默认","ord-btn ghost",function(){saveOrd(cur,ORD_DEF[cur].slice());buildToc()},"ordReset"));
    h.appendChild(mk("完成","ord-btn primary",function(){ordOpen=false;buildToc()},"ordDone"));p.appendChild(h);
    o.forEach(function(id,i){var r=document.createElement("div");r.className="ord-row"+(HID[id]?" off":"");var n=document.createElement("span");n.textContent=(canOrd?(i+1)+". ":"")+(NAMES[id]||nameOf(id))+(HID[id]?"（已隐藏）":"");r.appendChild(n);
      if(id!=="secBlocks")r.appendChild(mk(HID[id]?"显示":"隐藏","ord-btn"+(HID[id]?" primary":""),function(){setHid(id,!HID[id])},"ordH-"+id,(HID[id]?"显示 ":"隐藏 ")+(NAMES[id]||nameOf(id))));
      if(!canOrd){p.appendChild(r);return}
      function mv(d){var a=o.slice(),j=i+d;if(j<0||j>=a.length)return;var t=a[i];a[i]=a[j];a[j]=t;saveOrd(cur,a);buildToc();var f=$("ord"+(d<0?"U":"D")+"-"+id);if(f)f.focus()}
      var u=mk("↑","ord-btn",function(){mv(-1)},"ordU-"+id,"上移 "+NAMES[id]),d=mk("↓","ord-btn",function(){mv(1)},"ordD-"+id,"下移 "+NAMES[id]);u.disabled=i===0;d.disabled=i===o.length-1;
      r.appendChild(u);r.appendChild(d);p.appendChild(r)});
  }
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
    var nav=$("toc");nav.textContent="";nav.hidden=!TOC[cur].length;if(nav.hidden){var op=$("ordPanel");if(op)op.hidden=true;return;}
    TOC[cur].forEach(function(x){if(typeof isHid==="function"&&isHid(x[1]))return;var b=document.createElement("button");b.type="button";b.textContent=x[0];b.onclick=function(){go(x[1])};nav.appendChild(b);});
    if(cur!=="plan"){var a=document.createElement("button");a.type="button";a.className="toc-all";var o=anyOpen();a.textContent=o?"全部收起":"全部展开";
      a.onclick=function(){var v=anyOpen();TOC[cur].forEach(function(x){if(x[1] in FOLD)setF(x[1],v)});buildToc();};nav.appendChild(a);}
    if(BLK.some(function(g){return g[0]===cur})){var ob=document.createElement("button");ob.type="button";ob.className="toc-all";ob.id="ordBtn";ob.textContent=ordOpen?"收起":"管理板块";ob.onclick=function(){ordOpen=!ordOpen;buildToc()};nav.appendChild(ob)}
    nav.scrollLeft=0;ordPanel();
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
    if(t!==cur)ordOpen=false;cur=t;var T=TITLES[t];
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
  applyHid();applyTab(tabNow());shadeUpd();
  setTimeout(fab,800);
})();