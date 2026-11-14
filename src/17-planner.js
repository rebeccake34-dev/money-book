(function(){
  var DEFAULTS=[
    {id:"fit",name:"健身",h:0,subs:["胸","背","腿","肩","手臂","有氧","拉伸"]},
    {id:"study",name:"学习",h:215,subs:["阅读","网课","练习","复盘"]},
    {id:"work",name:"工作",h:262,subs:["上班","兼职","会议","求职"]},
    {id:"diet",name:"饮食",h:30,subs:["早餐","午餐","晚餐","加餐"]},
    {id:"water",name:"喝水",h:190,subs:["500ml","1L","1.5L","2L"]},
    {id:"cook",name:"做饭",h:15,subs:["备餐","早餐","午餐","晚餐"]},
    {id:"grocery",name:"采购",h:95,subs:["超市","菜市场","生活用品"]},
    {id:"shop",name:"购物",h:320,subs:["衣服","日用品","网购","礼物"]},
    {id:"save",name:"存钱",h:145,subs:["存入","记一笔支出","今日零花"]},
    {id:"stash",name:"攒钱",h:165,subs:["转入储蓄","查看目标进度","自动转账"]},
    {id:"review",name:"一月一复盘消费",h:45,subs:["本月总支出","超支项","下月预算"]},
    {id:"revise",name:"复习",h:235,subs:["今日内容","错题","单词"]},
    {id:"read",name:"读书",h:280,subs:["30分钟","1小时","读书笔记"]},
    {id:"tv",name:"看电视",h:340,subs:["剧集","电影","综艺"]},
    {id:"need",name:"需求复盘",h:55,subs:["想要还是需要","待买清单","冲动消费"]}
  ];
  var WD=["周日","周一","周二","周三","周四","周五","周六"];
  var WH=[335,4,30,48,130,199,262];
  var LKEY="year-end-planner-v1";
  var PRESETS=[["早上","07:00","09:00"],["上午","09:00","12:00"],["中午","12:00","14:00"],["下午","14:00","18:00"],["晚上","18:00","22:00"]];

  function $(id){return document.getElementById(id);}
  function pad(n){return n<10?"0"+n:""+n;}
  function ymd(d){return d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate());}
  function parse(s){var p=s.split("-");return new Date(+p[0],+p[1]-1,+p[2]);}
  function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,7);}
  function el(t,c,txt){var e=document.createElement(t);if(c)e.className=c;if(txt!=null)e.textContent=txt;return e;}
  function btn(c,txt,fn){var b=el("button",c,txt);b.type="button";if(fn)b.onclick=fn;return b;}
  function toMin(t){if(!t)return null;var p=t.split(":");return +p[0]*60+ +p[1];}
  function fmtRange(it){return it.start?it.start+(it.end?"–"+it.end:""):"";}
  function sorted(items){return items.map(function(x,i){return [x,i];}).sort(function(a,b){
    var sa=a[0].start||"99",sb=b[0].start||"99";return sa<sb?-1:sa>sb?1:a[1]-b[1];}).map(function(p){return p[0];});}

  var now=new Date(),today=new Date(now.getFullYear(),now.getMonth(),now.getDate());
  var end=new Date(2027,11,31),todayKey=ymd(today);
  var horizon=new Date(today);horizon.setDate(today.getDate()+84);if(horizon>end)horizon=new Date(end);
  var viewY=today.getFullYear(),viewM=today.getMonth(),viewMode="month";
  var totalDays=Math.round((end-today)/864e5)+1;
  function firstDay(){var ks=Object.keys(state.days).filter(function(k){return (state.days[k]||[]).length;}).sort();var f=ks.length&&ks[0]<todayKey?parse(ks[0]):new Date(today);
    var ws=new Date(today.getFullYear(),today.getMonth(),1);return f<ws?f:ws;}
  function setRange(){var f=firstDay(),n=Math.round((end-f)/864e5)+1;
    $("plRange").textContent="从 "+f.getFullYear()+"年"+(f.getMonth()+1)+"月"+f.getDate()+"日 起 · 可以安排到 2027 年 12 月 31 日 · 过去的记录都会保留";}

  var state={shortcuts:null,days:{},memos:[]};
  try{var c=JSON.parse(localStorage.getItem(LKEY)||"null");if(c&&c.days){state.days=c.days;state.shortcuts=c.shortcuts||null;state.memos=c.memos||[];}}catch(e){}
  var sel=todayKey,openCat=null,editMode=false,addingShortcut=false;
  var pendStart="",pendEnd="",paneMode="view",editId=null;
  var col=null,chains={};

  function shorts(){return state.shortcuts||DEFAULTS;}
  function findShort(id){var l=shorts();for(var i=0;i<l.length;i++)if(l[i].id===id)return l[i];return null;}
  function hueOf(cat){if(cat==="other")return 210;var s=findShort(cat);return s?s.h:210;}
  function label(it){var s=it.cat==="other"?null:findShort(it.cat);var n=s?s.name:(it.name||"事项");return it.sub?n+" · "+it.sub:n;}
  function setStatus(t){$("plStatus").textContent=t;}
  var toastT;
  function toast(t){var e=$("plToast");e.textContent=t;e.hidden=false;clearTimeout(toastT);toastT=setTimeout(function(){e.hidden=true;},2200);}

  function cacheLocal(){try{localStorage.setItem(LKEY,JSON.stringify(state));}catch(e){}}
  function write(docId,body){
    cacheLocal();
    if(!col)return;
    chains[docId]=(chains[docId]||Promise.resolve()).then(function(){var ref=col.doc(docId);return body?ref.set(body):ref.delete();})
      .catch(function(e){setStatus(e&&e.code==="quota_exceeded"?"存储已满，请删除一些旧内容":"保存失败，稍后再试");});
  }
  function saveDay(k){var it=state.days[k]||[];if(!it.length)delete state.days[k];write("day-"+k,it.length?{date:k,items:it}:null);}
  function saveShorts(){write("shortcuts",{list:state.shortcuts});}
  function ensureCustom(){if(!state.shortcuts)state.shortcuts=JSON.parse(JSON.stringify(DEFAULTS));}

  // ---- calendar ----
  var cal=$("plCal");
  function minMonth(){var f=firstDay();return f.getFullYear()*12+f.getMonth();}
  function maxMonth(){return end.getFullYear()*12+end.getMonth();}
  function clampView(){var v=viewY*12+viewM,lo=minMonth(),hi=maxMonth();if(v<lo)v=lo;if(v>hi)v=hi;viewY=Math.floor(v/12);viewM=v%12;}
  function renderCal(){
    setRange();
    var yearMode=viewMode==="year";
    $("plViewMonth").setAttribute("aria-pressed",String(!yearMode));$("plViewYear").setAttribute("aria-pressed",String(yearMode));
    cal.hidden=yearMode;$("plYear").hidden=!yearMode;
    if(yearMode){renderYear();try{window.__overview&&window.__overview();}catch(e){}return;}
    clampView();
    $("plMTitle").textContent=viewY+"年"+(viewM+1)+"月";
    $("plPrev").disabled=viewY*12+viewM<=minMonth();$("plNext").disabled=viewY*12+viewM>=maxMonth();
    cal.textContent="";
    var first=new Date(viewY,viewM,1),last=new Date(viewY,viewM+1,0);
    var d=new Date(first);d.setDate(first.getDate()-((first.getDay()+6)%7));
    while(d<=last){
      var ws=new Date(d),we=new Date(ws);we.setDate(we.getDate()+6);
      cal.appendChild(el("div","pl-wl",(ws.getMonth()+1)+"/"+ws.getDate()+" – "+(we.getMonth()+1)+"/"+we.getDate()));
      var row=el("div","pl-week");
      for(var j=0;j<7;j++){var day=new Date(ws);day.setDate(ws.getDate()+j);var c=dayCard(day);if(day.getMonth()!==viewM)c.classList.add("pl-out");row.appendChild(c);}
      cal.appendChild(row);
      d.setDate(d.getDate()+7);
    }
    try{window.__overview&&window.__overview();}catch(e){}
  }
  function renderYear(){
    $("plMTitle").textContent=viewY+" 年";
    $("plPrev").disabled=viewY<=Math.floor(minMonth()/12);$("plNext").disabled=viewY>=end.getFullYear();
    var y=$("plYear");y.textContent="";
    for(var m=0;m<12;m++){
      var box=el("div","pl-ym"),hd=el("button","pl-ymh",(m+1)+"月");hd.type="button";hd.dataset.m=m;box.appendChild(hd);
      var g=el("div","pl-ymg");["一","二","三","四","五","六","日"].forEach(function(w){g.appendChild(el("span","pl-ymw",w));});
      var f=new Date(viewY,m,1),pad0=(f.getDay()+6)%7;for(var i=0;i<pad0;i++)g.appendChild(el("span","pl-ymx"));
      var dim=new Date(viewY,m+1,0).getDate();
      for(var dd=1;dd<=dim;dd++){var dt=new Date(viewY,m,dd),k=ymd(dt),n=(state.days[k]||[]).length+memosOn(k).length;
        var inRange=dt>=firstDay()&&dt<=end;
        var c=el("button","pl-ymd"+(k===todayKey?" pl-today":"")+(k<todayKey?" pl-past":"")+(n?" has":"")+(!inRange?" off":""),String(dd));c.type="button";
        if(n)c.style.setProperty("--n",Math.min(n,4));
        var cyy=window.__cycleMark&&window.__cycleMark(k,"plan");if(cyy&&cyy.kind==="p")c.classList.add(cyy.pred?"cy-pp":"cy-p");
        c.dataset.k=k;c.disabled=!inRange;c.setAttribute("aria-label",(m+1)+"月"+dd+"日"+(n?"，"+n+" 项安排":""));g.appendChild(c);}
      box.appendChild(g);y.appendChild(box);
    }
  }
  $("plYear").addEventListener("click",function(e){var b=e.target.closest("button");if(!b)return;
    if(b.dataset.k){var d=parse(b.dataset.k);viewMode="month";viewY=d.getFullYear();viewM=d.getMonth();select(b.dataset.k);return;}
    if(b.dataset.m!=null){viewMode="month";viewM=+b.dataset.m;renderCal();}});
  $("plPrev").onclick=function(){if(viewMode==="year")viewY--;else{viewM--;if(viewM<0){viewM=11;viewY--;}}renderCal();};
  $("plNext").onclick=function(){if(viewMode==="year")viewY++;else{viewM++;if(viewM>11){viewM=0;viewY++;}}renderCal();};
  $("plViewMonth").onclick=function(){viewMode="month";renderCal();};
  $("plViewYear").onclick=function(){viewMode="year";renderCal();};
  function dayCard(day){
    var k=ymd(day);
    if(day>end){var v=el("div","pl-day pl-void");v.setAttribute("aria-hidden","true");return v;}
    var items=state.days[k]||[];
    var card=el("div","pl-day"+(k<todayKey?" pl-past":"")+(k===todayKey?" pl-today":"")+(k===sel?" pl-sel":""));
    card.tabIndex=0;card.setAttribute("role","button");card.dataset.k=k;
    card.style.setProperty("--h",WH[day.getDay()]);
    card.setAttribute("aria-label",(day.getMonth()+1)+"月"+day.getDate()+"日 "+WD[day.getDay()]);
    var h=el("div","pl-dh");h.appendChild(el("b",null,(day.getMonth()+1)+"/"+day.getDate()));
    var r=el("span",null,WD[day.getDay()]);
    if(items.length){var done=items.filter(function(i){return i.done;}).length;r.appendChild(document.createTextNode(" "+done+"/"+items.length));}
    h.appendChild(r);card.appendChild(h);
    var chips=el("div","pl-chips");
    var cym=window.__cycleMark&&window.__cycleMark(k,"plan");
    if(cym){chips.appendChild(el("span","pl-chip pl-cyc"+(cym.kind==="ov"?" pl-cyo":cym.pred?" pl-cyp":""),cym.text));card.setAttribute("aria-label",card.getAttribute("aria-label")+"，"+cym.text);}
    sorted(items).forEach(function(it){
      var ch=el("span","pl-chip"+(it.done?" pl-done":""));ch.style.setProperty("--h",hueOf(it.cat));
      ch.appendChild(el("i","pl-dot"));ch.appendChild(el("span","pl-t",(it.start?it.start+" ":"")+label(it)));chips.appendChild(ch);
    });
    memosOn(k).filter(function(m){return !items.some(function(i){return i.memo===m.id;});}).forEach(function(m){var ch=el("span","pl-chip pl-mchip"+((m.rep?occDone(m,k):m.done)?" pl-done":""));ch.style.setProperty("--h",45);
      ch.appendChild(el("span","pl-t",(m.rep?REP[m.rep]+" · ":"备忘 · ")+(m.time?m.time+" ":"")+m.text));chips.appendChild(ch);});
    card.appendChild(chips);
    return card;
  }
  cal.addEventListener("click",function(e){var c=e.target.closest(".pl-day[data-k]");if(c)select(c.dataset.k);});
  cal.addEventListener("keydown",function(e){if((e.key==="Enter"||e.key===" ")&&e.target.dataset&&e.target.dataset.k){e.preventDefault();select(e.target.dataset.k);}});
  function select(k){if(k!==sel)paneMode=(state.days[k]||[]).length||memosOn(k).length?"view":"add";sel=k;var d=parse(k);viewY=d.getFullYear();viewM=d.getMonth();renderCal();renderPanel();panel.classList.add("pl-open");}

  // ---- panel ----
  var panel=$("plPanel");
  function addItem(cat,sub,name){
    var l=state.days[sel]||(state.days[sel]=[]);
    var it={id:uid(),cat:cat,sub:sub||"",name:name||"",note:"",done:false,start:pendStart||"",end:pendStart?(pendEnd||""):""};
    l.push(it);saveDay(sel);renderCal();renderPanel();
    var d=parse(sel);toast("已添加「"+label(it)+"」到 "+(d.getMonth()+1)+"月"+d.getDate()+"日"+(it.start?" "+fmtRange(it):""));
  }
  // ---- edit an item's time / day in place ----
  function m2t(m){m=Math.max(0,Math.min(23*60+59,m));return pad(Math.floor(m/60))+":"+pad(m%60);}
  function setTime(it,st,en,k){it.start=st||"";it.end=st&&en?en:"";if(it.end&&toMin(it.end)<=toMin(it.start))it.end="";
    saveDay(k);renderCal();if(it.cutRef&&window.__cutSetTime)try{window.__cutSetTime(k,it.cutRef,it.start)}catch(e){}}
  function timeEditor(it,tbtn){
    var k=sel,box=el("div","pl-ted");
    var dur=it.start&&it.end?toMin(it.end)-toMin(it.start):null;
    var r1=el("div","pl-tedr");
    var a=el("input");a.type="time";a.value=it.start||"";a.setAttribute("aria-label","开始时间");
    var b=el("input");b.type="time";b.value=it.end||"";b.setAttribute("aria-label","结束时间");
    a.onchange=function(){var d=it.start&&it.end?toMin(it.end)-toMin(it.start):null;var en=it.end;if(a.value&&d!=null&&d>0)en=m2t(toMin(a.value)+d);setTime(it,a.value,en,k);b.value=it.end;tbtn.firstChild.nodeValue=(it.start?fmtRange(it):"不定时")+"  ✎ 调整时间";};
    b.onchange=function(){if(!it.start&&b.value){toast("先选开始时间");b.value="";return;}setTime(it,it.start,b.value,k);b.value=it.end;tbtn.firstChild.nodeValue=(it.start?fmtRange(it):"不定时")+"  ✎ 调整时间";};
    r1.appendChild(el("span","pl-tedl","开始"));r1.appendChild(a);r1.appendChild(el("span","pl-tedl","结束"));r1.appendChild(b);box.appendChild(r1);
    function chipRow(lbl,list){var r=el("div","pl-tedr");r.appendChild(el("span","pl-tedl",lbl));list.forEach(function(x){r.appendChild(btn("pl-tc",x[0],x[1]));});box.appendChild(r);}
    function shift(m){return function(){if(!it.start){toast("这项还没有时间，先选一个开始时间");return;}
      var d=it.end?toMin(it.end)-toMin(it.start):null,ns=toMin(it.start)+m;if(ns<0||ns>23*60+59)return;
      setTime(it,m2t(ns),d!=null?m2t(ns+d):"",k);renderPanel();};}
    chipRow("挪动",[["提前 1 小时",shift(-60)],["提前 15 分",shift(-15)],["推后 15 分",shift(15)],["推后 1 小时",shift(60)]]);
    chipRow("时长",[[" 30 分钟",30],[" 1 小时",60],[" 1.5 小时",90],[" 2 小时",120]].map(function(x){return [x[0].trim(),function(){if(!it.start){toast("先选开始时间");return;}setTime(it,it.start,m2t(toMin(it.start)+x[1]),k);renderPanel();}];}));
    chipRow("改到",[["不定时",function(){setTime(it,"","",k);renderPanel();}]].concat(PRESETS.map(function(p){return [p[0]+" "+p[1],function(){setTime(it,p[1],dur!=null?m2t(toMin(p[1])+dur):p[2],k);renderPanel();}];})));
    var r4=el("div","pl-tedr");r4.appendChild(el("span","pl-tedl","换天"));
    if(it.cutRef){r4.appendChild(el("span","note","这项来自运动打卡，换天请到健身日历里改"));}
    else{var di=el("input");di.type="date";di.value=k;di.min=ymd(new Date(today.getFullYear()-1,0,1));di.max=ymd(end);di.setAttribute("aria-label","改到哪一天");
      di.onchange=function(){var nk=di.value;if(!nk||nk===k)return;if(it.done&&it.sync)syncOff(it,k);
        state.days[k]=(state.days[k]||[]).filter(function(y){return y.id!==it.id;});saveDay(k);
        (state.days[nk]||(state.days[nk]=[])).push(it);saveDay(nk);editId=null;renderCal();renderPanel();
        var d2=parse(nk);toast("已挪到 "+(d2.getMonth()+1)+"月"+d2.getDate()+"日");};
      r4.appendChild(di);}
    box.appendChild(r4);
    var ok=btn("pl-btn","完成",function(){editId=null;renderPanel();});box.appendChild(ok);
    return box;
  }
  function renderPanel(){
    var a=document.activeElement;
    if(a&&panel.contains(a)&&(a.classList.contains("pl-note")||(a.closest&&a.closest(".pl-ted")&&a.tagName==="INPUT")))return;
    var tlPrev=panel.querySelector(".pl-tl"),tlScroll=tlPrev?tlPrev.scrollTop:null;
    panel.textContent="";
    var d=parse(sel),nItems=(state.days[sel]||[]).length;
    var ph=el("div","pl-ph");
    ph.appendChild(el("h3",null,(d.getMonth()+1)+"月"+d.getDate()+"日 "+WD[d.getDay()]+(sel===todayKey?" · 今天":"")));
    var pbx=el("div","pl-row");
    var pb=btn("pl-btn","打印这天",function(){printDay(sel);});
    pbx.appendChild(pb);pbx.appendChild(btn("pl-btn pl-close","收起",function(){panel.classList.remove("pl-open");}));
    ph.appendChild(pbx);panel.appendChild(ph);
    var seg=el("div","pl-pane");seg.setAttribute("role","tablist");seg.setAttribute("aria-label","查看或添加");
    [["view","查看当天"+(nItems?" · "+nItems:"")],["add","添加计划"]].forEach(function(p){var bb=btn("pl-pbtn",p[1],function(){paneMode=p[0];renderPanel();});
      bb.setAttribute("role","tab");bb.setAttribute("aria-selected",String(paneMode===p[0]));seg.appendChild(bb);});
    panel.appendChild(seg);

    if(paneMode==="view"){
    try{var cyl=window.__cycleLine&&window.__cycleLine(sel,"plan");if(cyl){var cyt=el("div","pl-tip pl-cyt");cyt.appendChild(el("span",null,cyl));
      if(sel<=todayKey&&window.__cycleOpen)cyt.appendChild(btn("pl-link",sel===todayKey?"记录今天":"记录这天",function(){window.__cycleOpen(sel);}));panel.appendChild(cyt);}}catch(e){}
    var nx=new Date(d);nx.setDate(d.getDate()+1);
    if(nx.getDate()===1&&!(state.days[sel]||[]).some(function(i){return i.cat==="review";})){
      var tip=el("div","pl-tip");tip.appendChild(el("span",null,"今天是月底，做一次本月消费复盘吧"));
      tip.appendChild(btn("pl-link","添加",function(){addItem("review","本月总支出");}));panel.appendChild(tip);
    }

    if(sel<=todayKey)panel.appendChild(memoryBox(sel));
    var dm=memosOn(sel).map(function(m){return [m,m.rep?sel:null];});
    if(sel===todayKey)state.memos.forEach(function(m){if(m.done)return;
      if(m.rep){var st=repState(m);if(st.diff<0)dm.push([m,st.cur]);}else if(m.due&&m.due<todayKey)dm.push([m,null]);});
    if(dm.length){var mb=el("div");mb.appendChild(el("p","pl-lbl",sel===todayKey?"今天要处理的备忘":"这天到期的备忘"));
      var ml=el("div","pl-mlist");dm.forEach(function(p){ml.appendChild(memoRow(p[0],p[1]));});mb.appendChild(ml);panel.appendChild(mb);}


    // timeline (view only)
    var tlw=el("div");var tlh=el("div","pl-ph2");tlh.appendChild(el("p","pl-lbl","时间轴 · 点某个小时就能在那个时间加计划"));tlw.appendChild(tlh);
    var tl=el("div","pl-tl"),dItems=state.days[sel]||[],anchor=null,firstH=null;
    sorted(dItems).forEach(function(it){var s0=toMin(it.start);if(s0!=null&&firstH==null)firstH=Math.floor(s0/60);});
    var nowH=sel===todayKey?new Date().getHours():null;
    for(var h=0;h<24;h++)(function(h){
      var hs=pad(h)+":00",he=h===23?"23:59":pad(h+1)+":00";
      var r=el("div","pl-hr"+(h===nowH?" pl-now":""));r.tabIndex=0;r.setAttribute("role","button");r.setAttribute("aria-label","在 "+hs+"–"+he+" 加计划");
      r.appendChild(el("span","pl-hl",hs));
      var box=el("div","pl-hitems");
      sorted(dItems).forEach(function(it){
        var s0=toMin(it.start);if(s0==null)return;var e=toMin(it.end);
        var here=Math.floor(s0/60)===h,covers=here||(e!=null&&e>s0&&s0<h*60&&e>h*60);
        if(!covers)return;
        var ch=el("span","pl-chip"+(it.done?" pl-done":"")+(here?"":" pl-cont"));ch.style.setProperty("--h",hueOf(it.cat));
        ch.appendChild(el("i","pl-dot"));ch.appendChild(el("span","pl-t",here?fmtRange(it)+" "+label(it):label(it)+" …"));
        ch.title="点一下调整时间";ch.onclick=function(e){e.stopPropagation();editId=it.id;renderPanel();setTimeout(function(){var r=panel.querySelector("#plcb-"+CSS.escape(it.id));if(r)r.closest(".pl-item").scrollIntoView({block:"nearest",behavior:"smooth"});},30);};
        box.appendChild(ch);
      });
      memosOn(sel).forEach(function(m){if(!m.time||Math.floor(toMin(m.time)/60)!==h)return;var ch=el("span","pl-chip pl-mchip");ch.style.setProperty("--h",45);ch.appendChild(el("span","pl-t",m.time+" "+m.text));box.appendChild(ch);});
      if(!box.childNodes.length)box.appendChild(el("span","pl-plus","＋"));
      r.appendChild(box);
      var pick=function(){pendStart=hs;pendEnd=he;paneMode="add";renderPanel();toast("时间设为 "+hs+"–"+he+"，点一个快捷键就加进去");};
      r.onclick=pick;r.onkeydown=function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();pick();}};
      if(anchor==null&&h===(firstH!=null?(nowH!=null?Math.min(firstH,Math.max(0,nowH-1)):firstH):(nowH!=null?Math.max(0,nowH-1):7)))anchor=r;
      tl.appendChild(r);
    })(h);
    tlw.appendChild(tl);panel.appendChild(tlw);
    if(tlScroll!=null)tl.scrollTop=tlScroll;else if(anchor)tl.scrollTop=Math.max(0,anchor.offsetTop-4);

    var ls=el("div"),items=state.days[sel]||[];
    ls.appendChild(el("p","pl-lbl","当天清单"+(items.length?" · "+items.filter(function(i){return i.done;}).length+"/"+items.length+" 完成":"")));
    var list=el("div","pl-list");
    if(!items.length)list.appendChild(el("p","pl-empty","还没有安排。切到「添加计划」加进来。"));
    sorted(items).forEach(function(it){
      var row=el("div","pl-item"+(it.done?" pl-done":""));row.style.setProperty("--h",hueOf(it.cat));
      var cb=el("input");cb.type="checkbox";cb.checked=!!it.done;cb.id="plcb-"+it.id;cb.setAttribute("aria-label","完成 "+label(it));
      cb.onchange=function(){toggleDone(it,cb.checked);};
      var mid=el("div");mid.appendChild(el("div","pl-name",label(it)));
      var itm=el("div","pl-itime");
      var tbtn=btn("pl-tbtn"+(editId===it.id?" pl-on":""),(it.start?fmtRange(it):"不定时")+"  ✎ 调整时间",function(){editId=editId===it.id?null:it.id;renderPanel();});
      tbtn.setAttribute("aria-expanded",String(editId===it.id));itm.appendChild(tbtn);
      if(editId===it.id)itm.appendChild(timeEditor(it,tbtn));      mid.appendChild(itm);
      var note=el("input","pl-note");note.type="text";note.id="plnote-"+it.id;note.value=it.note||"";note.placeholder="备注：时长、金额、内容…";
      note.onchange=function(){it.note=note.value;saveDay(sel);};
      note.onkeydown=function(e){if(e.key==="Enter")note.blur();};
      mid.appendChild(note);
      if(it.sync&&it.sync.msg)mid.appendChild(el("div","pl-sync","已同步："+it.sync.msg));
      if(it.cat==="review")mid.appendChild(summaryBox(sel));
      var x=btn("pl-del","✕",function(){if(it.done&&it.sync)syncOff(it,sel);state.days[sel]=(state.days[sel]||[]).filter(function(y){return y.id!==it.id;});saveDay(sel);renderCal();renderPanel();});
      x.setAttribute("aria-label","删除 "+label(it));
      row.appendChild(cb);row.appendChild(mid);row.appendChild(x);list.appendChild(row);
    });
    ls.appendChild(list);panel.appendChild(ls);
    } else {
    // ---- 添加计划 (compact) ----
    var tq=el("div","pl-tq");tq.appendChild(el("span","pl-lbl","时间"));
    var tchips=el("div","pl-tchips");
    [["不定时","",""]].concat(PRESETS).forEach(function(p){var on=pendStart===p[1]&&pendEnd===p[2];
      var b=btn("pl-tc"+(on?" pl-on":""),p[1]?p[0]+" "+p[1]:p[0],function(){pendStart=p[1];pendEnd=p[2];renderPanel();});b.setAttribute("aria-pressed",String(on));tchips.appendChild(b);});
    tq.appendChild(tchips);
    var tb=el("div","pl-timebar");
    var ta=el("input");ta.type="time";ta.id="plStart";ta.value=pendStart;ta.setAttribute("aria-label","开始时间");
    var te=el("input");te.type="time";te.id="plEnd";te.value=pendEnd;te.setAttribute("aria-label","结束时间");
    ta.onchange=function(){pendStart=ta.value;renderPanel();};te.onchange=function(){pendEnd=te.value;renderPanel();};
    tb.appendChild(el("span","note","自定义"));tb.appendChild(ta);tb.appendChild(el("span",null,"–"));tb.appendChild(te);
    tq.appendChild(tb);panel.appendChild(tq);

    // shortcuts
    var sec=el("div");sec.appendChild(el("p","pl-lbl","点快捷键添加 · 点开可选细项"));
    var g=el("div","pl-shorts");
    shorts().forEach(function(s){
      var b=btn("pl-sbtn",null,function(){openCat=openCat===s.id?null:s.id;editMode=false;renderPanel();});
      b.style.setProperty("--h",s.h);b.setAttribute("aria-expanded",openCat===s.id?"true":"false");
      b.appendChild(el("i","pl-dot"));b.appendChild(el("span",null,s.name));b.appendChild(el("span","pl-arr",openCat===s.id?"▲":"▼"));
      g.appendChild(b);
    });
    g.appendChild(btn("pl-btn","＋ 新快捷键",function(){addingShortcut=!addingShortcut;renderPanel();}));
    sec.appendChild(g);panel.appendChild(sec);

    if(addingShortcut){
      var r=el("div","pl-row");var inp=el("input");inp.type="text";inp.id="plNewShort";inp.placeholder="比如：冥想、遛弯、护肤";
      var go=function(){var v=inp.value.trim();if(!v){toast("先输入快捷键名称");return;}ensureCustom();
        var s={id:"c"+uid(),name:v,h:(state.shortcuts.length*47+12)%360,subs:[],custom:true};
        state.shortcuts.push(s);saveShorts();addingShortcut=false;openCat=s.id;renderPanel();toast("已创建快捷键："+v);};
      inp.onkeydown=function(e){if(e.key==="Enter")go();};
      r.appendChild(inp);r.appendChild(btn("pl-btn","创建",go));panel.appendChild(r);setTimeout(function(){inp.focus();},0);
    }

    var s=openCat&&findShort(openCat);
    if(s){
      var ex=el("div","pl-expand");ex.style.setProperty("--h",s.h);
      var h4=el("h4");h4.appendChild(el("span",null,s.name));
      h4.appendChild(btn("pl-link",editMode?"完成":"编辑选项",function(){editMode=!editMode;renderPanel();}));ex.appendChild(h4);
      var subs=el("div","pl-subs");
      if(!editMode)subs.appendChild(btn(null,"直接添加",function(){addItem(s.id,"");}));
      s.subs.forEach(function(sub,idx){
        var b=btn(null,null);b.appendChild(el("span",null,sub));
        if(editMode){b.appendChild(el("span","pl-x","✕"));b.setAttribute("aria-label","删除选项 "+sub);
          b.onclick=function(){ensureCustom();findShort(s.id).subs.splice(idx,1);saveShorts();renderPanel();};}
        else b.onclick=function(){addItem(s.id,sub);};
        subs.appendChild(b);
      });
      ex.appendChild(subs);
      var r2=el("div","pl-row");var si=el("input");si.type="text";si.id="plNewSub";si.placeholder="扩展一个新选项，比如：臀腿日";
      var addSub=function(){var v=si.value.trim();if(!v){toast("先输入选项名称");return;}ensureCustom();findShort(s.id).subs.push(v);saveShorts();renderPanel();
        toast("「"+s.name+"」新增选项："+v);var n=$("plNewSub");if(n)n.focus();};
      si.onkeydown=function(e){if(e.key==="Enter")addSub();};
      r2.appendChild(si);r2.appendChild(btn("pl-btn","加入",addSub));ex.appendChild(r2);
      extraFor(s,ex);
      if(editMode&&s.custom)ex.appendChild(btn("pl-link","删除这个快捷键",function(){ensureCustom();
        state.shortcuts=state.shortcuts.filter(function(x){return x.id!==s.id;});openCat=null;saveShorts();renderPanel();}));
      panel.appendChild(ex);
    }

    var fr=el("div","pl-row");var fi=el("input");fi.type="text";fi.id="plFree";fi.placeholder="自由添加一件事…";
    var fgo=function(){var v=fi.value.trim();if(!v)return;addItem("other","",v);};
    fi.onkeydown=function(e){if(e.key==="Enter")fgo();};
    fr.appendChild(fi);fr.appendChild(btn("pl-btn","添加",fgo));panel.appendChild(fr);

    if(nItems){var bk=el("p","pl-hint");bk.appendChild(document.createTextNode("这天已有 "+nItems+" 项。"));bk.appendChild(btn("pl-link","去查看",function(){paneMode="view";renderPanel();}));panel.appendChild(bk);}
    }
  }

  // ---- links to 省钱账本 and 运动打卡 ----
  var HINT={
    fit:"今天打勾：运动打卡里今天的动作全部勾上，账本记一次「完成一次训练」。选「有氧」→ 运动打卡有氧打勾；选「拉伸」→ 账本记「训练后拉伸」。",
    water:"今天打勾：按选项的量（如 500ml、1.5L）加进运动打卡的喝水。",
    diet:"备注写热量和蛋白质（如 450kcal 30g），今天打勾时自动加进运动打卡的饮食记录。",
    cook:"打勾：账本记一次「自己带饭，不点外卖」。",
    study:"打勾：账本记一次「学习了 30 分钟」。",
    revise:"打勾：账本记一次「学习了 30 分钟」。",
    shop:"备注写金额（如 $45），打勾后自动记进「日常开支」。",
    grocery:"备注写金额（如 $60），打勾后自动记进「日常开支」（买菜）。",
    need:"在账本里记了坏习惯消费，第二天会自动加一条这里的「冲动消费」复盘。"
  };
  function parseAmt(t){t=String(t||"");var m=t.match(/[$¥]\s*(\d+(?:\.\d+)?)/)||t.match(/(\d+(?:\.\d+)?)/);return m?+m[1]:null;}
  function parseMl(t){var m=String(t||"").match(/(\d+(?:\.\d+)?)\s*(ml|l)\b/i);if(!m)return null;return Math.round(+m[1]*(m[2].toLowerCase()==="l"?1000:1));}
  function syncOn(it,k){
    var L=window.__ledger,C=window.__cut,sy={},msg=[],isT=k===todayKey,sub=it.sub||"",cat=it.cat;
    if(k>todayKey)return {sy:null,msg:"还没到这一天，到那天打勾才会同步打卡"};
    if(cat==="fit"){
      if(/有氧/.test(sub)){if(isT&&C&&!C.cardio()){C.setCardio(true);sy.cardio=true;msg.push("运动打卡有氧 ✓");}}
      else if(/拉伸/.test(sub)){if(L&&L.log(k,"stretch",1)){sy.led=["stretch"];msg.push("账本「训练后拉伸」+1");}}
      else{if(isT&&C){var idx=C.checkAllEx();if(idx.length){sy.ex=idx;msg.push("运动打卡动作全部勾上");}}
        if(L&&L.log(k,"train",1)){sy.led=["train"];msg.push("账本「完成一次训练」+1");}}
    }else if(cat==="water"){var ml=parseMl(sub)||parseMl(it.note)||500;if(isT&&C){sy.water=C.addWater(ml);msg.push("喝水 +"+ml+" ml");}}
    else if(cat==="cook"){if(L&&L.log(k,"meal",1)){sy.led=["meal"];msg.push("账本「自己带饭」+"+L.money(L.val("meal")));}}
    else if(cat==="study"||cat==="revise"){if(L&&L.log(k,"study",1)){sy.led=["study"];msg.push("账本「学习了 30 分钟」+1");}}
    else if(cat==="shop"||cat==="grocery"){var E=window.__expenses,amt=parseAmt(it.note);
      if(E&&amt&&k<=todayKey){sy.exp=E.add(amt,cat==="grocery"?"买菜":"购物",(it.sub?it.sub+" ":"")+(it.note||"").replace(/[$¥]?\s*\d+(\.\d+)?/,"").trim(),k,"plan");msg.push("日常开支 +$"+amt.toFixed(2));}}
    else if(cat==="diet"){var n=it.note||"",kc=n.match(/(\d+)\s*(kcal|千卡|大卡|卡)/i),pr=n.match(/(\d+(?:\.\d+)?)\s*(g|克)(?![a-z])/i);
      if(isT&&C&&kc){sy.food=C.addFood(label(it),+kc[1],pr?Math.round(+pr[1]):0);msg.push("饮食 +"+kc[1]+" kcal"+(pr?" / 蛋白质 "+Math.round(+pr[1])+" g":""));}}
    else if((cat==="save"&&/存入/.test(sub))||(cat==="stash"&&/转入/.test(sub))){
      if(L&&L.ready()){var a=parseAmt(it.note);if(a==null){var w=L.week(k);a=w.transferred==null?Math.round(w.cash*100)/100:0;}
        if(a>0){L.addTransfer(a,k);sy.tr=a;msg.push("账本转入储蓄 +"+L.money(a));}}}
    if(msg.length)sy.msg=msg.join("，");
    return {sy:Object.keys(sy).length?sy:null,msg:msg.join("，")};
  }
  function syncOff(it,k){
    var s=it.sync||{},L=window.__ledger,C=window.__cut;
    (s.led||[]).forEach(function(id){if(L)L.log(k,id,-1);});
    if(C&&k===todayKey){if(s.ex)C.uncheckEx(s.ex);if(s.cardio)C.setCardio(false);if(s.water)C.removeWater(s.water);if(s.food)C.removeFood(s.food);}
    if(s.tr&&L)L.addTransfer(-s.tr,k);
    if(s.exp&&window.__expenses)window.__expenses.remove(s.exp);
    delete it.sync;
  }
  function toggleDone(it,v){
    var msg="";it.done=v;
    if(it.memo){var mo=state.memos.filter(function(m){return m.id===it.memo;})[0];if(mo){if(mo.rep){var a=(mo.doneDates||[]).filter(function(x){return x!==sel;});if(v)a.push(sel);mo.doneDates=a;}else{mo.done=v;mo.doneAt=v?Date.now():null;}saveMemos();renderMemos();}}
    if(v){var r=syncOn(it,sel);if(r.sy)it.sync=r.sy;msg=r.msg;}
    else if(it.sync){syncOff(it,sel);msg="已撤销同步的打卡";}
    saveDay(sel);renderCal();renderPanel();
    toast(v?("完成「"+label(it)+"」"+(msg?" · "+msg:"")):(msg||"已取消完成"));
  }
  function scheduleTraining(){
    var C=window.__cut;if(!C)return;
    var st=pendStart||"18:00",en=pendStart?(pendEnd||""):"19:30",n=0;
    for(var d=new Date(today);d<=horizon;d.setDate(d.getDate()+1)){
      var p=C.planFor(d),sub=p.type==="train"?p.name:(/有氧/.test(p.name)?"有氧":null);if(!sub)continue;
      var k=ymd(d),l=state.days[k]||(state.days[k]=[]);
      if(l.some(function(i){return i.auto==="train";})){if(!l.length)delete state.days[k];continue;}
      l.push({id:uid(),cat:"fit",sub:sub,name:"",note:"",done:false,start:st,end:en,auto:"train"});n++;saveDay(k);
    }
    renderCal();renderPanel();
    toast(n?"已排入接下来 12 周里 "+n+" 天的训练（"+st+(en?"–"+en:"")+"）":"接下来 12 周的训练已经排好了");
  }
  function clearTraining(){
    var n=0;Object.keys(state.days).forEach(function(k){if(k<todayKey)return;var l=state.days[k],b=l.length;
      state.days[k]=l.filter(function(i){return !(i.auto==="train"&&!i.done);});
      if(state.days[k].length!==b){n+=b-state.days[k].length;saveDay(k);}});
    renderCal();renderPanel();toast("已清除 "+n+" 条未完成的自动训练");
  }
  function monthSummary(k){
    var d=parse(k),y=d.getFullYear(),m=d.getMonth(),pre=y+"-"+pad(m+1),L=window.__ledger,out=[];
    if(L&&L.ready()){var s=L.month(y,m);
      out.push("账本本月净省 "+L.money(s.net)+"（当场省 "+L.money(s.cash)+"，以后少花 "+L.money(s.fut)+"）"+(s.transferred?"，已转入储蓄 "+L.money(s.transferred):""));
      out.push(s.bad.length?"坏习惯花得最多："+s.bad.slice(0,3).map(function(r){return r.name+" "+r.n+" 次 "+L.money(r.amt);}).join("；"):"坏习惯：本月没有记录");
      if(s.good.length)out.push("坚持最多："+s.good.slice(0,3).map(function(r){return r.name+" "+r.n+" 次";}).join("；"));}
    var tot=0,dn=0,shopN=0,shopAmt=0,fitN=0;
    Object.keys(state.days).forEach(function(dk){if(dk.indexOf(pre)!==0)return;(state.days[dk]||[]).forEach(function(i){
      tot++;if(i.done)dn++;if(i.cat==="shop"||i.cat==="grocery"){shopN++;var a=parseAmt(i.note);if(a)shopAmt+=a;}if(i.cat==="fit"&&i.done)fitN++;});});
    out.push("计划本月 "+tot+" 项，完成 "+dn+" 项"+(tot?"（"+Math.round(dn/tot*100)+"%）":"")+"，健身完成 "+fitN+" 次");
    var E=window.__expenses;if(E){var em=E.month(y,m);out.push(em.count?"日常开支 "+(L?L.money(em.total):"$"+em.total.toFixed(2))+"（"+em.count+" 笔）"+(em.budget?"，预算 "+(L?L.money(em.budget):"$"+em.budget)+(em.total>em.budget?"，超出了":"，没超"):"")+"；最多："+em.byCat.slice(0,3).map(function(c){return c[0]+" "+(L?L.money(c[1]):"$"+c[1].toFixed(2));}).join("、"):"日常开支：本月没有记录");}
    out.push("购物 / 采购 "+shopN+" 次"+(shopAmt?"，备注里记的金额合计 "+(L?L.money(shopAmt):"$"+shopAmt.toFixed(2)):""));
    return out;
  }
  // ---- 备忘录 ----
  var memoDue="",memoTime="",memoDraft="",memoRep="";
  var REP={day:"每天",week:"每周","2week":"每两周",month:"每月"};
  function stepFrom(a,r,n){var d=parse(a);if(r==="month"){var day=d.getDate(),x=new Date(d.getFullYear(),d.getMonth()+n,1);
      x.setDate(Math.min(day,new Date(x.getFullYear(),x.getMonth()+1,0).getDate()));return x;}
    d.setDate(d.getDate()+n*(r==="day"?1:r==="week"?7:14));return d;}
  function occBetween(m,from,to){var out=[];for(var n=0;n<2000;n++){var k=ymd(stepFrom(m.start,m.rep,n));if(k>to)break;if(k>=from)out.push(k);}return out;}
  function isOcc(m,k){return k>=m.start&&occBetween(m,k,k).length>0;}
  function occDone(m,k){return (m.doneDates||[]).indexOf(k)>=0;}
  function repState(m){
    var last=null,next=null;for(var n=0;n<2000;n++){var k=ymd(stepFrom(m.start,m.rep,n));if(k<=todayKey)last=k;else{next=k;break;}}
    var cur=(last&&!occDone(m,last))?last:next;if(!cur)cur=next;
    var diff=Math.round((parse(cur)-today)/864e5);
    return {cur:cur,diff:diff,last:last,next:next};
  }
  function saveMemos(){write("memos",{list:state.memos});}
  function memosOn(k){return state.memos.filter(function(m){return m.rep?isOcc(m,k):m.due===k;}).sort(function(a,b){return (a.time||"99")<(b.time||"99")?-1:1;});}
  function memoCounts(){var o=0,t=0,open=0;state.memos.forEach(function(m){if(m.done)return;open++;if(m.rep){var st=repState(m);if(st.diff<0)o++;else if(st.diff===0)t++;return;}if(m.due&&m.due<todayKey)o++;else if(m.due===todayKey)t++;});return {over:o,today:t,open:open};}
  function whenText(m){
    if(m.rep){var st=repState(m),d=parse(st.cur),t=m.time?" "+m.time:"";
      return (st.diff<0?"这次已过期 "+(-st.diff)+" 天（"+(d.getMonth()+1)+"/"+d.getDate()+"）":st.diff===0?"今天"+t:"下次 "+(d.getMonth()+1)+"月"+d.getDate()+"日 "+WD[d.getDay()]+t);}
    if(!m.due)return "没有日期";
    var d=parse(m.due),diff=Math.round((d-today)/864e5),t=m.time?" "+m.time:"";
    if(diff<0)return "已过期 "+(-diff)+" 天（"+(d.getMonth()+1)+"/"+d.getDate()+"）";
    if(diff===0)return "今天"+t;if(diff===1)return "明天"+t;if(diff===2)return "后天"+t;
    return (d.getMonth()+1)+"月"+d.getDate()+"日 "+WD[d.getDay()]+t+(diff<=7?" · "+diff+" 天后":"");
  }
  function repRow(m,k){
    var st=repState(m),day=k||st.cur,dn=occDone(m,day),diff=k?Math.round((parse(k)-today)/864e5):st.diff;
    var row=el("div","pl-mi pl-rep"+(dn?" pl-mdone":diff<0?" pl-over":diff===0?" pl-due":""));
    var cb=el("input");cb.type="checkbox";cb.checked=dn;cb.id="plr-"+m.id+"-"+day;cb.setAttribute("aria-label","完成 "+m.text);
    cb.onchange=function(){setOcc(m,day,cb.checked);var d=parse(day);
      toast(cb.checked?"已完成 "+(d.getMonth()+1)+"/"+d.getDate()+" 的「"+m.text+"」"+(k?"":"，下次 "+whenText(m).replace("下次 ","")):"已改回未完成");};
    var mid=el("div");mid.appendChild(el("div","pl-mt",m.text));
    var md=el("div","pl-md");md.appendChild(el("span","pl-reptag",REP[m.rep]));
    if(k){var kd=parse(k);md.appendChild(el("span","pl-when",(kd.getMonth()+1)+"/"+kd.getDate()+(m.time?" "+m.time:"")));}
    else md.appendChild(el("span","pl-when",whenText(m)));
    var dd=(m.doneDates||[]).slice().sort();
    if(!k&&dd.length){var ld=parse(dd[dd.length-1]);md.appendChild(el("span",null,"上次完成 "+(ld.getMonth()+1)+"/"+ld.getDate()+" · 共 "+dd.length+" 次"));
      md.appendChild(btn("pl-link","撤销上次",function(){setOcc(m,dd[dd.length-1],false);toast("已撤销上次完成");}));}
    mid.appendChild(md);
    var cd=el("div","pl-cd");
    if(dn){cd.appendChild(el("b",null,"✓"));cd.appendChild(el("span",null,"已完成"));}
    else if(diff===0){cd.appendChild(el("b",null,"今天"));cd.appendChild(el("span",null,"到期"));}
    else if(diff<0){cd.appendChild(el("b",null,String(-diff)));cd.appendChild(el("span",null,"天前到期"));}
    else{cd.appendChild(el("b",null,String(diff)));cd.appendChild(el("span",null,"天后"));}
    var act=el("div","pl-mact");
    if(!k){var occ=occBetween(m,todayKey>m.start?todayKey:m.start,ymd(horizon)),need=occ.filter(function(o){return !(state.days[o]||[]).some(function(i){return i.memo===m.id;});});
      if(need.length)act.appendChild(btn("pl-link","排进计划（"+need.length+" 天）",function(){
        need.forEach(function(o){var l=state.days[o]||(state.days[o]=[]);l.push({id:uid(),cat:"other",sub:"",name:m.text,note:REP[m.rep]+"提醒",done:occDone(m,o),start:m.time||"",end:"",memo:m.id});saveDay(o);});
        renderCal();renderPanel();renderMemos();toast("已排进接下来 12 周里的 "+need.length+" 天");}));
      var x=btn("pl-del","✕",function(){state.memos=state.memos.filter(function(y){return y.id!==m.id;});saveMemos();renderMemos();renderCal();renderPanel();toast("已删除「"+m.text+"」，已排进计划的项目会保留");});
      x.setAttribute("aria-label","删除 "+m.text);act.appendChild(x);}
    row.appendChild(cb);row.appendChild(mid);row.appendChild(cd);row.appendChild(act);return row;
  }
  function setOcc(m,day,v){
    var a=(m.doneDates||[]).filter(function(x){return x!==day;});if(v)a.push(day);m.doneDates=a;saveMemos();
    (state.days[day]||[]).forEach(function(i){if(i.memo===m.id&&i.done!==v){i.done=v;saveDay(day);}});
    renderMemos();renderCal();renderPanel();
  }
  function memoRow(m,k){
    if(m.rep)return repRow(m,k);
    var cls="pl-mi"+(m.done?" pl-mdone":!m.due?"":m.due<todayKey?" pl-over":m.due===todayKey?" pl-due":"");
    var row=el("div",cls);
    var cb=el("input");cb.type="checkbox";cb.checked=!!m.done;cb.id="plm-"+m.id;cb.setAttribute("aria-label","完成 "+m.text);
    cb.onchange=function(){m.done=cb.checked;m.doneAt=cb.checked?Date.now():null;saveMemos();
      if(m.due)(state.days[m.due]||[]).forEach(function(i){if(i.memo===m.id&&i.done!==m.done){i.done=m.done;saveDay(m.due);}});renderMemos();renderCal();renderPanel();toast(cb.checked?"已完成：「"+m.text+"」":"已改回待办");};
    var mid=el("div");mid.appendChild(el("div","pl-mt",m.text));
    var md=el("div","pl-md");md.appendChild(el("span","pl-when",whenText(m)));
    var inPlan=m.due&&(state.days[m.due]||[]).some(function(i){return i.memo===m.id;});
    if(inPlan)md.appendChild(el("span",null,"已排进计划"));
    mid.appendChild(md);
    var act=el("div","pl-mact");
    if(!m.done&&m.due&&!inPlan&&m.due>=firstDayKey()){act.appendChild(btn("pl-link","排进计划",function(){
      var l=state.days[m.due]||(state.days[m.due]=[]);
      l.push({id:uid(),cat:"other",sub:"",name:m.text,note:"来自备忘录",done:false,start:m.time||"",end:"",memo:m.id});
      saveDay(m.due);renderCal();renderPanel();renderMemos();var d=parse(m.due);toast("已排进 "+(d.getMonth()+1)+"月"+d.getDate()+"日 的计划");}));}
    var x=btn("pl-del","✕",function(){state.memos=state.memos.filter(function(y){return y.id!==m.id;});saveMemos();renderMemos();renderCal();renderPanel();toast("已删除备忘");});
    x.setAttribute("aria-label","删除 "+m.text);act.appendChild(x);
    row.appendChild(cb);row.appendChild(mid);row.appendChild(act);return row;
  }
  function firstDayKey(){return ymd(firstDay());}
  function renderMemos(){
    var box=$("plMemo"),a=document.activeElement,refocus=a&&box.contains(a)&&a.id==="plMemoText";
    box.textContent="";
    var mc=memoCounts();
    var h=el("div","pl-mh");h.appendChild(el("h3",null,"备忘录"));
    var cnt=el("span","pl-mcount");
    if(mc.over){cnt.appendChild(el("b",null,mc.over+" 项已过期"));cnt.appendChild(document.createTextNode(" · "));}
    cnt.appendChild(document.createTextNode(mc.open?mc.open+" 项待办"+(mc.today?" · 今天到期 "+mc.today+" 项":""):"没有待办"));
    h.appendChild(cnt);box.appendChild(h);
    var f=el("form","pl-mform");f.noValidate=true;
    var ti=el("input");ti.type="text";ti.id="plMemoText";ti.placeholder="写下要记住的事，比如：交房租、缴话费（可设每周、每月重复）";ti.maxLength=200;ti.value=memoDraft;ti.oninput=function(){memoDraft=ti.value;};
    var di=el("input");di.type="date";di.id="plMemoDate";di.value=memoDue;di.setAttribute("aria-label","截止日期");di.onchange=function(){memoDue=di.value;renderMemos();};
    var tm=el("input");tm.type="time";tm.id="plMemoTime";tm.value=memoTime;tm.setAttribute("aria-label","时间");tm.onchange=function(){memoTime=tm.value;};
    var ab=el("button","pl-btn","添加");ab.type="submit";
    var rs=el("select");rs.id="plMemoRep";rs.setAttribute("aria-label","重复");
    [["","不重复"],["day","每天"],["week","每周"],["2week","每两周"],["month","每月"]].forEach(function(o){var op=el("option",null,o[1]);op.value=o[0];rs.appendChild(op);});
    rs.value=memoRep;rs.onchange=function(){memoRep=rs.value;if(memoRep&&!memoDue)memoDue=todayKey;renderMemos();};
    f.appendChild(ti);f.appendChild(rs);f.appendChild(di);f.appendChild(tm);f.appendChild(ab);
    f.onsubmit=function(e){e.preventDefault();var v=ti.value.trim();if(!v){toast("先写下要记住的事");ti.focus();return;}
      if(memoRep){var st0=memoDue||todayKey;state.memos.push({id:uid(),text:v,rep:memoRep,start:st0,due:"",time:memoTime||"",doneDates:[],done:false,at:Date.now()});}
      else state.memos.push({id:uid(),text:v,due:memoDue||"",time:memoDue?(memoTime||""):"",done:false,at:Date.now()});
      saveMemos();memoDraft="";var added=state.memos[state.memos.length-1];memoDue="";memoTime="";memoRep="";renderMemos();renderCal();renderPanel();
      toast("已加进备忘录"+(added.rep?"："+REP[added.rep]+"，"+whenText(added):added.due?"："+whenText(added):""));var n=$("plMemoText");if(n)n.focus();};
    box.appendChild(f);
    var q=el("div","pl-mquick"),add=function(n){var d=new Date(today);d.setDate(d.getDate()+n);return ymd(d);};
    var sun=new Date(today);sun.setDate(today.getDate()+((7-today.getDay())%7));
    [["今天",add(0)],["明天",add(1)],["后天",add(2)],["本周日",ymd(sun)]].concat(memoRep?[]:[["不定日期",""]]).forEach(function(p){
      q.appendChild(btn("pl-btn"+(memoDue===p[1]?" pl-on":""),p[0],function(){memoDue=p[1];if(!p[1])memoTime="";renderMemos();}));});
    box.appendChild(q);
    if(memoRep)box.appendChild(el("p","pl-hint","「"+REP[memoRep]+"」从 "+(function(){var d=parse(memoDue||todayKey);return (d.getMonth()+1)+"月"+d.getDate()+"日";})()+" 开始。完成一次后会自动跳到下一次，日历上会标出到 2027 年底的每一次。"));
    var reps=state.memos.filter(function(m){return m.rep;}).sort(function(a,b){return repState(a).diff-repState(b).diff;});
    if(reps.length){var rg=el("div","pl-mgroup");rg.appendChild(el("p","pl-lbl","长期计时 · 重复提醒"));
      reps.forEach(function(m){rg.appendChild(memoRow(m));});box.appendChild(rg);}
    var open=state.memos.filter(function(m){return !m.done&&!m.rep;}).sort(function(a,b){
      var ka=a.due?a.due+(a.time||"99"):"9999",kb=b.due?b.due+(b.time||"99"):"9999";return ka<kb?-1:ka>kb?1:a.at-b.at;});
    var list=el("div","pl-mlist");
    if(reps.length)list.appendChild(el("p","pl-lbl","待办"));
    if(!open.length)list.appendChild(el("p","pl-empty","还没有待办。写下一件要记住的事，设个日期，到期那天会在日历、当天面板和首页提醒你。"));
    open.forEach(function(m){list.appendChild(memoRow(m));});
    box.appendChild(list);
    var done=state.memos.filter(function(m){return m.done&&!m.rep;}).sort(function(a,b){return (b.doneAt||0)-(a.doneAt||0);});
    if(done.length){var dt=el("details","pl-mdetails");dt.appendChild(el("summary",null,"已完成（"+done.length+"）"));
      var dl=el("div","pl-mlist");done.forEach(function(m){dl.appendChild(memoRow(m));});dt.appendChild(dl);
      dt.appendChild(btn("pl-link","清除已完成",function(){state.memos=state.memos.filter(function(m){return !m.done;});saveMemos();renderMemos();renderCal();toast("已清除已完成的备忘");}));
      box.appendChild(dt);}
    if(refocus){var nf=$("plMemoText");if(nf)nf.focus();}
    try{window.__overview&&window.__overview();}catch(e){}
  }
  function memoryBox(k){
    var b=el("div","pl-info"),C=window.__cut,L=window.__ledger,items=state.days[k]||[],any=false;
    b.appendChild(el("b",null,k===todayKey?"今天到目前的记录":"这天的记录"));
    if(items.length){any=true;var dn=items.filter(function(i){return i.done;}).length;
      b.appendChild(el("p",null,"计划：完成 "+dn+"/"+items.length+" 项"+(dn<items.length?"，没完成："+items.filter(function(i){return !i.done;}).map(label).join("、"):"")));}
    var r=C&&C.record?C.record(k):null;
    if(r&&(r.exDone||r.cardio||r.water||r.kcal||r.weight)){any=true;
      b.appendChild(el("p",null,"运动打卡："+r.plan+(r.exTotal?" 动作 "+r.exDone+"/"+r.exTotal:"")+(r.cardio?" · 有氧 ✓":"")+" · 喝水 "+r.water+" ml"+(r.weight?" · 体重 "+r.weight+" kg":"")));
      if(r.kcal)b.appendChild(el("p",null,"饮食："+r.kcal+" kcal · 蛋白质 "+r.pro+" g"+(r.food.length?"（"+r.food.join("、")+"）":"")));}
    var dd=L&&L.ready()?L.dayDetail(k):[];
    if(dd.length){any=true;var net=L.day(k).net;
      b.appendChild(el("p",null,"省钱账本："+(net>=0?"+":"")+L.money(net)+" · "+dd.map(function(x){return x.name+(x.n>1?" ×"+x.n:"");}).join("、")));}
    if(!any)b.appendChild(el("p","pl-hint",k===todayKey?"今天还没有记录。":"这天没有留下记录。"));
    return b;
  }
  function summaryBox(k){var b=el("div","pl-sum");b.appendChild(el("b",null,(parse(k).getMonth()+1)+"月消费复盘（自动汇总）"));
    monthSummary(k).forEach(function(t){b.appendChild(el("span",null,t));});return b;}
  function extraFor(s,ex){
    var L=window.__ledger,C=window.__cut;
    if(HINT[s.id])ex.appendChild(el("p","pl-hint",HINT[s.id]));
    if(s.id==="fit"&&C){var bx=el("div","pl-info");
      bx.appendChild(el("p",null,"按运动打卡里的每周训练计划，把接下来 12 周的训练日和有氧日排进来。时间用上面选的时间段，没选就默认 18:00–19:30。"));
      var rr=el("div","pl-row");rr.appendChild(btn("pl-btn","一键排入训练",scheduleTraining));rr.appendChild(btn("pl-link","清除未完成的自动训练",clearTraining));
      bx.appendChild(rr);ex.appendChild(bx);}
    if((s.id==="save"||s.id==="stash")&&L&&L.ready()){var w=L.week(todayKey),bx2=el("div","pl-info");
      bx2.appendChild(el("p",null,"本周当场省下 "+L.money(w.cash)+" · "+(w.transferred!=null?"本周已转入 "+L.money(w.transferred):"本周还没转入储蓄")));
      bx2.appendChild(el("p",null,"累计已转入储蓄 "+L.money(w.totalT)+" · 账本累计净省 "+L.money(w.allNet)));
      if(w.transferred==null&&w.cash>0)bx2.appendChild(btn("pl-btn","把本周省下的 "+L.money(w.cash)+" 转入储蓄",function(){
        L.addTransfer(Math.round(w.cash*100)/100,todayKey);toast("已记入账本：本周转入储蓄 "+L.money(w.cash));renderPanel();}));
      bx2.appendChild(el("p","pl-hint","打勾「存入」或「转入储蓄」时：备注写了金额（如 $50）就按这个金额记入储蓄，没写就记本周省下的钱。"));
      ex.appendChild(bx2);}
    if(s.id==="review")ex.appendChild(summaryBox(sel));
  }
  window.__planFit={
    upsert:function(k,ref,o){var l=state.days[k]||(state.days[k]=[]);
      if(ref==="plan")l=state.days[k]=l.filter(function(i){return !(i.auto==="train"&&!i.done&&!i.cutRef);});
      var it=null;l.forEach(function(i){if(i.cutRef===ref)it=i;});
      if(!it){it={id:uid(),cat:"fit",sub:"",name:"",note:"",done:false,start:"",end:"",cutRef:ref};l.push(it);}
      it.sub=o.sub;it.start=o.start||"";it.end=o.end||"";it.note=o.note||"";if(o.done!=null)it.done=o.done;
      saveDay(k);renderCal();renderPanel();},
    remove:function(k,ref){var l=state.days[k];if(!l)return;var n=l.length;state.days[k]=l.filter(function(i){return i.cutRef!==ref;});if(state.days[k].length!==n){saveDay(k);renderCal();renderPanel();}},
    prune:function(k,keep){var l=state.days[k];if(!l)return;var n=l.length;state.days[k]=l.filter(function(i){return !(i.cutRef&&i.cutRef!=="plan"&&keep.indexOf(i.cutRef)<0);});if(state.days[k].length!==n){saveDay(k);renderCal();renderPanel();}}
  };
  window.__planRefresh=function(){try{renderCal();renderPanel();}catch(e){}};
  window.__planToday=function(){return sorted(state.days[todayKey]||[]).map(function(i){return {id:i.id,label:label(i),start:i.start||"",end:i.end||"",done:!!i.done,note:i.note||""};});};
  window.__planToggle=function(id,v){var it=(state.days[todayKey]||[]).filter(function(i){return i.id===id;})[0];if(!it)return;sel=todayKey;toggleDone(it,!!v);};
  window.__planMemo=function(){return memoCounts();};
  window.__bk=window.__bk||{};
  window.__bk.plan={
    dump:function(){return JSON.parse(JSON.stringify(state));},
    merge:function(d){if(!d||!d.days)return 0;var n=0;
      function sig(i){return i.cutRef?"c:"+i.cutRef:i.auto?"a:"+i.auto+"|"+(i.sub||""):i.from?"f:"+i.from:i.memo?"m:"+i.memo:"s:"+[i.cat,i.sub,i.name,i.start,i.end,i.note].join("|");}
      Object.keys(d.days).forEach(function(k){if(!/^\d{4}-\d\d-\d\d$/.test(k))return;var b=d.days[k]||[];if(!b.length)return;
        var a=(state.days[k]||[]).slice(),ids={},sigs={},ch=false;a.forEach(function(i){ids[i.id]=1;sigs[sig(i)]=1;});
        b.forEach(function(i){if(!i||!i.id||ids[i.id]||sigs[sig(i)])return;a.push(i);ids[i.id]=1;sigs[sig(i)]=1;ch=true;});
        if(ch){state.days[k]=a;saveDay(k);n++;}});
      var mid={},mc=false;state.memos.forEach(function(m){mid[m.id]=1;});
      (d.memos||[]).forEach(function(m){if(m&&m.id&&!mid[m.id]){state.memos.push(m);mid[m.id]=1;mc=true;n++;}});if(mc)saveMemos();
      if(!state.shortcuts&&d.shortcuts){state.shortcuts=d.shortcuts;saveShorts();}
      renderCal();renderPanel();renderMemos();return n;}
  };
  window.__workOn=function(k){return (state.days[k]||[]).filter(function(i){return i.cat==="work"&&i.start;}).map(function(i){return {start:i.start,end:i.end};});};
  window.__planSelect=function(k){if(typeof showTab==="function")showTab("plan");sel=k;viewMode="month";var d0=parse(k);viewY=d0.getFullYear();viewM=d0.getMonth();renderCal();renderPanel();panel.classList.add("pl-open");
    setTimeout(function(){var c=cal.querySelector('[data-k="'+k+'"]');if(c)c.scrollIntoView({block:"center",behavior:"smooth"});},60);};
  window.__onLedgerBad=function(h,k){
    if(!h.kind||h.kind.indexOf("bad-cash")!==0)return;
    var nd=parse(k);nd.setDate(nd.getDate()+1);if(nd>end)return;var nk=ymd(nd),l=state.days[nk]||(state.days[nk]=[]);
    if(l.some(function(i){return i.cat==="need"&&i.from===h.id;}))return;
    l.push({id:uid(),cat:"need",sub:"冲动消费",name:"",note:"前一天："+h.name+"。想要还是需要？",done:false,start:"",end:"",from:h.id});
    saveDay(nk);renderCal();if(sel===nk)renderPanel();
    setTimeout(function(){toast("已在 "+(nd.getMonth()+1)+"月"+nd.getDate()+"日 的计划里加了一条「需求复盘」");},2400);
  };
  window.__overview=function(){try{
    var items=state.days[todayKey]||[],done=items.filter(function(i){return i.done;}).length,nm=new Date(),cur=nm.getHours()*60+nm.getMinutes();
    var nx=sorted(items).filter(function(i){return !i.done&&i.start&&toMin(i.end||i.start)>=cur;})[0];
    $("ovPlanV").textContent=items.length?done+"/"+items.length+" 项完成":"还没有安排";
    var mc=memoCounts(),mtxt=(mc.over?"过期备忘 "+mc.over+" 项 · ":"")+(mc.today?"今天到期 "+mc.today+" 项 · ":"");
    $("ovPlanS").textContent=mtxt+(nx?"下一项 "+nx.start+" "+label(nx):(!items.length?"点这里安排今天":done===items.length?"今天全部完成":"还有 "+(items.length-done)+" 项没完成"));
    var C=window.__cut;if(C){var t=C.today();$("ovCutV").textContent=t.plan+(t.exTotal?" · 动作 "+t.exDone+"/"+t.exTotal:"");
      $("ovCutS").textContent="喝水 "+t.water+"/"+t.waterT+" ml · 蛋白质 "+t.pro+"/"+t.proT+" g";}
    var L=window.__ledger;if(L&&L.ready()){var dd=L.day(todayKey),w=L.week(todayKey);
      $("ovLedV").textContent="今天 "+(dd.net>=0?"+":"")+L.money(dd.net);$("ovLedS").textContent="本周净省 "+L.money(w.net)+(window.__expenses?" · 今天花了 "+L.money(window.__expenses.day(todayKey)):"")+(w.transferred!=null?" · 已转入储蓄":"");}
  }catch(e){}};
  function goTab(n){if(typeof showTab==="function")showTab(n);var tb=document.querySelector(".tabs");if(tb)tb.scrollIntoView({behavior:"smooth",block:"start"});}
  $("ovPlan").onclick=function(){sel=todayKey;renderCal();goTab("plan");};
  $("ovCut").onclick=function(){goTab("cut");};
  $("ovLed").onclick=function(){goTab("ledger");};
  $("ovSav").onclick=function(){if(typeof showTab==="function")showTab("ledger");var s=$("savSec");if(s)s.scrollIntoView({behavior:"smooth",block:"start"});};

  // ---- one-page A4 printout ----
  function fit(x,t,w){if(x.measureText(t).width<=w)return t;while(t.length>1&&x.measureText(t+"…").width>w)t=t.slice(0,-1);return t+"…";}
  function drawDay(k){
    var d=parse(k),items=state.days[k]||[];
    var W=1240,H=1754,M=90,S=1654/1240;
    var cv=document.createElement("canvas");cv.width=Math.round(W*S);cv.height=Math.round(H*S);
    var x=cv.getContext("2d");x.scale(S,S);
    var F='"Noto Sans SC","PingFang SC","Hiragino Sans GB","Microsoft YaHei",sans-serif';
    var INK="#2b2a33",MUT="#77727f",LINE="#dedae4";
    x.fillStyle="#fff";x.fillRect(0,0,W,H);
    x.fillStyle="hsl("+WH[d.getDay()]+" 85% 72%)";x.fillRect(0,0,W,28);
    x.fillStyle=INK;x.font="700 62px "+F;x.fillText((d.getMonth()+1)+"月"+d.getDate()+"日  "+WD[d.getDay()],M,130);
    x.font="26px "+F;x.fillStyle=MUT;x.fillText(d.getFullYear()+" · 每日计划",M,172);
    if(items.length){x.textAlign="right";x.fillText("共 "+items.length+" 项",W-M,172);x.textAlign="left";}
    var timed=sorted(items).filter(function(i){return i.start;}),untimed=items.filter(function(i){return !i.start;});
    var h0=6;timed.forEach(function(i){h0=Math.min(h0,Math.floor(toMin(i.start)/60));});
    var byH={};timed.forEach(function(i){var h=Math.floor(toMin(i.start)/60);(byH[h]=byH[h]||[]).push(i);});
    var hours=[];for(var h=h0;h<24;h++)hours.push(h);
    var y=210,untRows=Math.ceil(untimed.length/2),C=window.__cut,L=window.__ledger,stats=[];
    try{if(C){var tg=C.targets(d);stats.push(["训练",tg.plan],["热量目标",tg.kcal+" kcal"],["蛋白质目标",tg.pro+" g"],["喝水目标",tg.water+" ml"]);}
      if(L&&L.ready()){var wk=L.week(k);stats.push(["本周已省",L.money(wk.net)]);}}catch(e){stats=[];}
    if(stats.length){var cw=(W-2*M-(stats.length-1)*12)/stats.length;
      stats.forEach(function(st,i){var sx=M+i*(cw+12);x.fillStyle="#f3f1f6";x.fillRect(sx,y,cw,84);
        x.fillStyle=MUT;x.font="20px "+F;x.fillText(st[0],sx+14,y+30);x.fillStyle=INK;x.font="700 25px "+F;x.fillText(fit(x,st[1],cw-28),sx+14,y+66);});
      y+=112;}
    var review=items.some(function(i){return i.cat==="review";}),rlines=review?monthSummary(k):[];
    var bottom=(untimed.length?70+untRows*46:0)+190+(review?60+rlines.length*36:0);
    var nLines=hours.reduce(function(s,h){return s+Math.max(1,(byH[h]||[]).length);},0);
    var lh=Math.max(22,Math.min(54,Math.floor((H-M-y-60-bottom)/nLines))),fs=Math.max(13,Math.round(lh*0.5));
    function title(t){x.fillStyle=INK;x.font="700 28px "+F;x.fillText(t,M,y+28);y+=48;}
    function box(bx,by,bs,done){x.strokeStyle="#5b5766";x.lineWidth=2;x.strokeRect(bx,by,bs,bs);
      if(done){x.beginPath();x.moveTo(bx+bs*.2,by+bs*.55);x.lineTo(bx+bs*.42,by+bs*.78);x.lineTo(bx+bs*.82,by+bs*.25);x.stroke();}}
    function itemLine(it,left,right,cy,h){
      var bs=Math.round(h*0.42);box(left,cy+(h-bs)/2,bs,it.done);
      x.fillStyle="hsl("+hueOf(it.cat)+" 70% 52%)";x.fillRect(left+bs+12,cy+h*0.22,6,h*0.56);
      var tx=left+bs+28;x.fillStyle=INK;x.font="600 "+fs+"px "+F;
      var main=fit(x,(it.start?fmtRange(it)+"  ":"")+label(it),right-tx);
      x.fillText(main,tx,cy+h*0.5+fs*0.36);
      var used=x.measureText(main).width;
      if(it.note&&tx+used+40<right){x.fillStyle=MUT;x.font=fs+"px "+F;x.fillText(fit(x,"  "+it.note,right-tx-used),tx+used,cy+h*0.5+fs*0.36);}
    }
    title("时间安排");
    var right=W-M;
    hours.forEach(function(h){
      var its=byH[h]||[];
      x.strokeStyle=LINE;x.lineWidth=1.5;x.beginPath();x.moveTo(M,y);x.lineTo(right,y);x.stroke();
      var lf=Math.min(24,fs);x.fillStyle=MUT;x.font="500 "+lf+"px "+F;x.fillText(pad(h)+":00",M,y+lh*0.5+lf*0.36);
      its.forEach(function(it,i){itemLine(it,M+110,right,y+i*lh,lh);});
      y+=Math.max(1,its.length)*lh;
    });
    x.strokeStyle=LINE;x.beginPath();x.moveTo(M,y);x.lineTo(right,y);x.stroke();
    y+=28;
    if(untimed.length){
      title("不定时 / 待办");
      var colW=(W-2*M-30)/2;
      untimed.forEach(function(it,i){var c=i%2,r=Math.floor(i/2);itemLine(it,M+c*(colW+30),M+c*(colW+30)+colW,y+r*46,46);});
      y+=untRows*46+22;
    }
    if(review){title((d.getMonth()+1)+"月消费复盘");x.font="22px "+F;x.fillStyle=INK;
      rlines.forEach(function(t){x.fillText(fit(x,"· "+t,W-2*M),M,y+22);y+=36;});y+=12;}
    title("今日复盘");
    x.strokeStyle=LINE;x.lineWidth=1.5;
    for(var ly=y+44;ly<H-M;ly+=44){x.beginPath();x.moveTo(M,ly);x.lineTo(right,ly);x.stroke();}
    return cv;
  }
  function deliver(blob,fn){
    if(window.claude&&window.claude.use){
      window.claude.use("downloads").then(function(dl){
        if(!dl){toast("这里不能下载文件");return;}
        return dl.save({filename:fn,data:blob}).then(function(r){if(r&&r.status==="saved")toast("已生成 A4 单页，打开后选择打印即可");},
          function(e){if(e&&e.code!=="declined")toast("没能生成文件，请稍后再试");});
      });
      return;
    }
    var url=URL.createObjectURL(blob),a=document.createElement("a");
    a.href=url;a.download=fn;document.body.appendChild(a);a.click();a.remove();
    setTimeout(function(){URL.revokeObjectURL(url);},60000);
    toast("已生成 A4 单页，打开后选择打印即可");
  }
  function printDay(k){
    var cv=drawDay(k),name="计划-"+k,jsPDF=window.jspdf&&window.jspdf.jsPDF,data=null;
    try{if(jsPDF){var pdf=new jsPDF({unit:"mm",format:"a4",orientation:"portrait"});
      pdf.addImage(cv.toDataURL("image/jpeg",0.92),"JPEG",0,0,210,297);data=pdf.output("blob");}}catch(e){data=null;}
    if(data)deliver(data,name+".pdf");else cv.toBlob(function(b){deliver(b,name+".png");},"image/png");
  }

  $("plGoToday").onclick=function(){viewMode="month";sel=todayKey;viewY=today.getFullYear();viewM=today.getMonth();renderCal();renderPanel();scrollToToday(true);};

  renderCal();renderPanel();renderMemos();
  try{window.__cut&&window.__cut.rerender()}catch(e){}
  function scrollToToday(smooth){
    var go=function(){var c=cal.querySelector('[data-k="'+todayKey+'"]');if(!c||$("plan").hidden)return;
      var r=c.getBoundingClientRect(),y=window.scrollY+r.top-Math.max(80,(window.innerHeight-r.height)/2);
      window.scrollTo({top:Math.max(0,y),behavior:smooth&&!(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches)?"smooth":"auto"});};
    requestAnimationFrame(function(){requestAnimationFrame(go);});setTimeout(go,250);
  }
  window.__planShown=function(){var t=panel.querySelector(".pl-tl");if(t)t.remove();
    viewMode="month";sel=todayKey;viewY=today.getFullYear();viewM=today.getMonth();renderCal();renderPanel();
    if(window.matchMedia&&matchMedia("(max-width:900px)").matches)panel.classList.remove("pl-open");
    scrollToToday(true);};
  if(!$("plan").hidden)window.__planShown();
  var reAimed=false,userMoved=false;["wheel","touchmove","keydown"].forEach(function(ev){window.addEventListener(ev,function(){userMoved=true;},{passive:true,once:true});});

  // ---- storage: claude.ai account when opened as an artifact, otherwise this browser ----
  if(!(window.claude&&window.claude.use)){setStatus("内容保存在这个浏览器里");return;}
  Promise.all([window.claude.use("db"),window.claude.use("user")]).then(function(r){
    var db=r[0],user=r[1];
    if(!db||!user){setStatus("内容保存在这个浏览器里");return;}
    return user.id().then(function(id){
      if(!id){setStatus("内容保存在这个浏览器里");return;}
      col=db.doc("data/users/"+id+"/planner").collection("days");
      var timer=setTimeout(function(){setStatus("暂时连不上，显示的是本机内容");},10000),first=true;
      col.onSnapshot(function(snap){
        if(!snap.metadata.fromCache){clearTimeout(timer);setStatus("已同步");}
        if(first&&snap.empty&&!snap.metadata.fromCache){first=false;
          Object.keys(state.days).forEach(function(k){if(state.days[k].length)write("day-"+k,{date:k,items:state.days[k]});});
          if(state.shortcuts)saveShorts();if(state.memos.length)saveMemos();return;}
        if(!snap.metadata.fromCache)first=false;
        var days={},sc=null,mm=[];
        snap.docs.forEach(function(d){var b=d.data();if(!b)return;b=JSON.parse(JSON.stringify(b));
          if(d.id==="shortcuts")sc=b.list||null;else if(d.id==="memos")mm=b.list||[];else if(b.date&&b.items)days[b.date]=b.items;});
        state.days=days;state.shortcuts=sc;state.memos=mm;cacheLocal();renderCal();renderPanel();renderMemos();if(!snap.metadata.fromCache&&!reAimed){reAimed=true;if(!userMoved&&!$("plan").hidden)scrollToToday(false);}
      },function(){clearTimeout(timer);setStatus("同步中断，内容先保存在这个浏览器里");col=null;});
    });
  }).catch(function(){setStatus("内容保存在这个浏览器里");});
})();