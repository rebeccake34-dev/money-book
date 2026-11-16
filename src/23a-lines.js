/* 生活主线：今天页的主线卡、每周回顾里的计划对比实际、设置页的主线设置。数据在日常计划模块（window.__lines）。 */
(function(){
  var $=function(id){return document.getElementById(id)};
  function el(t,c,x){var e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e}
  function btn(c,x,f,id){var b=el("button",c,x);b.type="button";if(id)b.id=id;b.onclick=f;return b}
  function toast(m){try{window.__toastAny&&window.__toastAny(m)}catch(e){}}
  function hrs(h){h=Math.round(h*10)/10;return (h%1?h.toFixed(1):String(h))}
  function amt(a,p){return p<1?Math.round(a*60)+" / "+Math.round(p*60)+" 分":hrs(a)+" / "+hrs(p)+" 时"}
  function go(tab,id){if(typeof showTab==="function")showTab(tab);setTimeout(function(){var e=id&&$(id);if(!e)return;if(e.classList.contains("folded")){var h=e.firstElementChild;if(h)h.click()}e.scrollIntoView({block:"start"})},60)}
  var KIND={project:"进行中",parked:"停放",routine:"例行"},LT={g:"绿",y:"黄",r:"红"};

  /* ---------- 今天页：主线卡 ---------- */
  var card=el("section","td-card");card.id="td-lines";
  function place(){var root=$("todayView");if(!root)return false;if(card.parentNode!==root){var top=$("td-top");root.insertBefore(card,top?top.nextSibling:root.firstChild)}return true}
  function dayIdx(){var d=new Date().getDay();return d===0?7:d}
  function renderToday(){var A=window.__lines,root=$("todayView");if(!A||!root||root.hidden||!place())return;
    card.textContent="";
    var st=A.status(),T=A.today(),tot=0,act=0;st.forEach(function(s){tot+=s.hrs;act+=s.act});
    var h=el("div","td-h");h.appendChild(el("b",null,"生活主线"));h.appendChild(el("span","td-sub","本周 "+hrs(act)+" / "+hrs(tot)+" 小时"));
    h.appendChild(btn("td-more","设置 ›",function(){go("set","secLines")}));card.appendChild(h);
    if(T.planned>T.cap*60){var a=el("p","td-alert");a.textContent="今天排了 "+hrs(T.planned/60)+" 小时，超过"+(T.weekend?"周末":"工作日")+"上限 "+hrs(T.cap)+" 小时，挪一项到别的天";card.appendChild(a)}
    if(!st.length){card.appendChild(el("p","td-note","还没有主线。到「设置 › 生活主线」加上每条线每周打算花几小时。"));return}
    var di=dayIdx();
    function addBtns(row,s,one){var b=el("div","td-btns");
      (one?[30]:[30,60]).forEach(function(m){b.appendChild(btn("td-btn td-keep","+"+m+"分",function(){A.log(s.id,m);toast("「"+s.name+"」记了 "+m+" 分钟")},"tdLn-"+s.id+"-"+m))});
      var last=T.last[s.id];if(last)b.appendChild(btn("td-btn ghost td-keep","撤销",function(){A.unlog(last)},"tdLnU-"+s.id));row.appendChild(b)}
    function bar(s){var b=el("div","td-bar"),i=el("i");i.style.width=Math.min(100,s.hrs?s.act/s.hrs*100:0)+"%";b.appendChild(i);return b}
    function behind(s){return di>=3&&s.act<s.hrs*di/7*0.6}
    st.filter(function(s){return s.kind==="project"}).forEach(function(s){var p=el("div","ln-p");
      var r=el("div","ln-top");r.appendChild(el("b",null,s.name));r.appendChild(el("span","ln-num",hrs(s.act)+" / "+hrs(s.hrs)+" 小时"+(T.by[s.id]?" · 今天 "+T.by[s.id]+" 分":"")));
      if(behind(s))r.appendChild(el("span","ln-tag","进度落后"));p.appendChild(r);p.appendChild(bar(s));
      var nr=el("div","ln-nrow"),nx=el("div","ln-next");if(s.next)nx.appendChild(el("span",null,"下一步："+s.next));else nx.appendChild(btn("pl-link td-keep","写下一步 ›",function(){go("set","secLines")}));nr.appendChild(nx);
      addBtns(nr,s);p.appendChild(nr);card.appendChild(p)});
    [["parked","停放 · 保持不忘"],["routine","例行"]].forEach(function(gk){var rest=st.filter(function(s){return s.kind===gk[0]});if(!rest.length)return;
      var g=el("div","ln-rest");g.appendChild(el("span","ln-glbl",gk[1]));rest.forEach(function(s){var r=el("div","ln-row");
      r.appendChild(el("span","ln-name",s.name));
      var v=el("div","ln-v");v.appendChild(el("span",null,amt(s.act,s.hrs)));v.appendChild(bar(s));r.appendChild(v);addBtns(r,s,true);g.appendChild(r)});card.appendChild(g)});
  }

  /* ---------- 每周回顾：计划对比实际 ---------- */
  function renderWeek(){var A=window.__lines,box=$("lineWeek");if(!A||!box)return;box.textContent="";
    var ws=A.weekStart(),cur=A.status(ws),prev=A.status(A.addDays(ws,-7)),pm={};prev.forEach(function(p){pm[p.id]=p});
    if(!cur.length)return;
    box.appendChild(el("h3",null,"主线用时：计划对比实际"));
    var tw=el("div","tbl"),t=el("table"),th=el("thead"),tr=el("tr");["主线","计划/周","本周","上周","上周状态"].forEach(function(x,i){var c=el("th",i?"n":null,x);tr.appendChild(c)});th.appendChild(tr);t.appendChild(th);
    var tb=el("tbody"),tp=0,ta=0,tq=0;
    cur.forEach(function(s){var p=pm[s.id]||{act:0,ratio:0,light:"r"},r=el("tr");tp+=s.hrs;ta+=s.act;tq+=p.act;
      r.appendChild(el("td",null,s.name+(s.kind!=="project"?"（"+KIND[s.kind]+"）":"")));r.appendChild(el("td","n",hrs(s.hrs)));r.appendChild(el("td","n",hrs(s.act)));r.appendChild(el("td","n",hrs(p.act)));
      var c=el("td","n");if(p.pre!==false)c.textContent="—";else{c.appendChild(el("span","ln-dot ln-d"+p.light));c.appendChild(document.createTextNode(LT[p.light]+" "+Math.round(p.ratio*100)+"%"))}r.appendChild(c);tb.appendChild(r)});
    var fr=el("tr","ln-sum");["合计",hrs(tp),hrs(ta),hrs(tq),""].forEach(function(x,i){fr.appendChild(el("td",i?"n":null,x))});tb.appendChild(fr);t.appendChild(tb);tw.appendChild(t);box.appendChild(tw);
    var tips=[];cur.forEach(function(s){if(s.low>=2)tips.push({t:"「"+s.name+"」连续 2 周低于计划的 60%：换方法、减量或停放",k:"bad"})});
    var np=cur.filter(function(s){return s.kind==="project"}).length;if(np>3)tips.push({t:"进行中的主线有 "+np+" 条，超过 3 条，建议停放几条",k:"bad"});
    box.appendChild(el("p","note","绿 ≥ 90%，黄 60–90%，红 < 60%；开始记录前的周显示「—」。实际用时来自日常计划里归到主线、已打勾的事项，和今天页的「+30分」。"));
    if(tips.length){var u=el("ul","td-list");tips.forEach(function(x){u.appendChild(el("li",x.k,x.t))});box.appendChild(u)}
  }

  /* ---------- 设置页：编辑主线 ---------- */
  var draft=null;
  function renderSet(){var A=window.__lines,box=$("lnSetBody");if(!A||!box)return;var a=document.activeElement;if(a&&box.contains(a)&&a.tagName!=="BUTTON")return;
    box.textContent="";draft=A.list();var cap=A.cap();
    box.appendChild(el("p","note","每条线写每周打算花几小时。「进行中」最多 3 条，今天页会显示它们的下一步；「停放」只保持不忘；「例行」没有终点，只看每周做没做到。"));
    function save(){A.set(draft,cap)}
    var ls=el("div","ln-set");
    draft.forEach(function(l,i){var r=el("div","ln-srow");
      var n=el("input");n.type="text";n.maxLength=20;n.value=l.name;n.setAttribute("aria-label","主线名称");n.id="lnN-"+l.id;n.onchange=function(){var v=n.value.trim();if(!v){n.value=l.name;return}l.name=v;save()};
      var k=el("select");k.setAttribute("aria-label","类型");k.id="lnK-"+l.id;["project","parked","routine"].forEach(function(x){var o=el("option",null,KIND[x]);o.value=x;k.appendChild(o)});k.value=l.kind;
      k.onchange=function(){l.kind=k.value;if(k.value==="project"&&draft.filter(function(x){return x.kind==="project"}).length>3)toast("进行中已超过 3 条，建议停放一条");save()};
      var hw=el("label","ln-h"),h=el("input");h.type="number";h.min="0";h.max="80";h.step="0.25";h.inputMode="decimal";h.value=l.hrs;h.id="lnH-"+l.id;h.setAttribute("aria-label","每周计划小时");
      h.onchange=function(){l.hrs=Math.max(0,Math.min(80,Math.round((+h.value||0)*4)/4));h.value=l.hrs;save()};hw.appendChild(h);hw.appendChild(el("span",null,"小时/周"));
      var nx=el("input","ln-nx");nx.type="text";nx.maxLength=80;nx.value=l.next||"";nx.placeholder=l.kind==="project"?"下一步：具体到能直接动手":"备注（可不填）";nx.id="lnX-"+l.id;nx.setAttribute("aria-label","下一步");nx.onchange=function(){l.next=nx.value.trim();save()};
      var del=btn("pl-del","✕",function(){if(del.dataset.arm){draft.splice(i,1);save();renderSet()}else{del.dataset.arm="1";del.textContent="确认删除";setTimeout(function(){if(del.isConnected){delete del.dataset.arm;del.textContent="✕"}},3000)}});
      del.setAttribute("aria-label","删除主线 "+l.name);
      [n,k,hw,nx,del].forEach(function(x){r.appendChild(x)});ls.appendChild(r)});
    box.appendChild(ls);
    var tot=draft.reduce(function(s,l){return s+(+l.hrs||0)},0);
    var add=el("div","bk-row");add.appendChild(btn("btn","＋ 添加主线",function(){draft.push({id:"ln"+Date.now().toString(36),name:"新主线",kind:"routine",hrs:1,next:"",h:(draft.length*47+12)%360});save();renderSet()},"lnAdd"));
    add.appendChild(el("span","note","合计 "+hrs(tot)+" 小时/周（不含工作）"));box.appendChild(add);
    var cr=el("div","ln-cap");cr.appendChild(el("span","note","每天最多排（不含上班）："));
    [["wd","工作日"],["we","周末"]].forEach(function(p){var w=el("label","ln-h"),i=el("input");i.type="number";i.min="0";i.max="16";i.step="0.5";i.inputMode="decimal";i.value=cap[p[0]];i.id="lnCap-"+p[0];
      i.onchange=function(){cap[p[0]]=Math.max(0,Math.min(16,+i.value||0));save()};w.appendChild(el("span",null,p[1]));w.appendChild(i);w.appendChild(el("span",null,"小时"));cr.appendChild(w)});
    box.appendChild(cr);
  }

  var timer=null;function all(){clearTimeout(timer);timer=setTimeout(function(){try{renderToday()}catch(e){try{window.__debugPush&&window.__debugPush("lines",e)}catch(x){}}try{renderWeek()}catch(e){}try{if(!$("setView").hidden)renderSet()}catch(e){}},60)}
  window.__linesRender=all;
  ["__todayRender","__todayShown","__overview"].forEach(function(n){var f=window[n];window[n]=function(){var r;try{r=f&&f.apply(this,arguments)}finally{all()}return r}});
  var fs=window.__setShown;window.__setShown=function(){var r;try{r=fs&&fs.apply(this,arguments)}finally{try{renderSet()}catch(e){}}return r};
  all();
})();
